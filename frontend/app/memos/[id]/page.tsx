"use client"

import { useState, useRef, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Search, Trash2, PenSquare, Eye, Edit3, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useMemos } from "@/hooks/use-memos"
import { Memo } from "@/type/type"
import { useParams, useRouter } from "next/navigation"
import { useNavigationBlocker } from "@/hooks/use-navigation-blocker"

export default function MarkdownMemoApp() {

  const { memos, setMemos, loading, updateMemo, createMemo } = useMemos();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useNavigationBlocker(
    () => hasChanges,
    (nextPath, proceed) => {
      nextPathRef.current = nextPath;
      setShowSaveConfirmDialog(true);
      // proceed関数を保存して、ダイアログが閉じられた後に呼び出す
      nextPathProceedRef.current = proceed;
    }
  );

  const nextPathProceedRef = useRef<(() => void) | null>(null);

  const [isPreviewMode, setIsPreviewMode] = useState(true)
  const [localContent, setLocalContent] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false)
  const nextPathRef = useRef<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)
  const cursorPositionRef = useRef(0)
  const isUpdatingRef = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // URL パラメータに基づいて選択されたメモを取得
  const selectedMemo = memos.find((m) => m.id === id) || null;
  
  // selectedMemoの内容が変更されたときにローカルのコンテンツを同期
  useEffect(() => {
    if (selectedMemo && !isUpdatingRef.current) {
      setLocalContent(selectedMemo.content || "");
      setHasChanges(false);
    }
  }, [selectedMemo?.content]);

  // 別のメモが選択されたときに表示モードを初期化
  useEffect(() => {
    if (selectedMemo) {
      // 新しいメモ（空のコンテンツ）の場合は編集モードに、それ以外はプレビューモードに設定
      setIsPreviewMode(selectedMemo.content !== "");
    }
  }, [selectedMemo?.id]);

  const handleNewMemo = async () => {
    try {
      const newMemo = await createMemo({
        title: "新しいメモ",
        content: "",
      });
      
      // 新しいメモのページに遷移
      if (newMemo.id) {
        router.push(`/memos/${newMemo.id}`);
      }
    } catch (error) {
      console.error('Failed to create new memo:', error);
    }
  }

  const handleSaveMemo = async () => {
    if (!selectedMemo?.id || !hasChanges) return;

    try {
      isUpdatingRef.current = true;
      const title = localContent.split("\n")[0].replace(/^#+ /, "") || "新しいメモ";
      await updateMemo(selectedMemo.id, { content: localContent, title });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save memo:', error);
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const handleContentChange = (content: string) => {
    // ローカル状態を即座に更新
    setLocalContent(content)
    setHasChanges(true)
    
    // カーソル位置を保存
    if (textareaRef.current) {
      cursorPositionRef.current = textareaRef.current.selectionStart
    }
    
    
  }

  // 編集モードに切り替わった時にフォーカスを設定
  useEffect(() => {
    if (!isPreviewMode && textareaRef.current && selectedMemo) {
      // 少し遅延してフォーカスを設定（レンダリング完了後）
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isPreviewMode, selectedMemo?.id])

  // クリーンアップ
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges) {
        event.preventDefault();
        event.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [hasChanges])

  // カーソル位置を復元するエフェクト
  useEffect(() => {
    if (textareaRef.current && !isPreviewMode) {
      const textarea = textareaRef.current
      const position = cursorPositionRef.current
      
      // 次のフレームでカーソル位置を復元
      requestAnimationFrame(() => {
        textarea.setSelectionRange(position, position)
      })
    }
  }, [localContent, isPreviewMode])

  const handleModeToggle = () => {
    // 現在のスクロール位置を保存
    if (isPreviewMode && previewRef.current) {
      scrollPositionRef.current = previewRef.current.scrollTop
    } else if (!isPreviewMode && textareaRef.current) {
      scrollPositionRef.current = textareaRef.current.scrollTop
    }

    setIsPreviewMode(!isPreviewMode)

    // モード切り替え後にスクロール位置を復元
    setTimeout(() => {
      if (isPreviewMode && textareaRef.current) {
        textareaRef.current.scrollTop = scrollPositionRef.current
      } else if (!isPreviewMode && previewRef.current) {
        previewRef.current.scrollTop = scrollPositionRef.current
      }
    }, 0)
  }

  return (
    < div className="flex-1 flex flex-col h-full" >
      <AlertDialog open={showSaveConfirmDialog} onOpenChange={setShowSaveConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>保存されていない変更があります</AlertDialogTitle>
            <AlertDialogDescription>
              現在のメモには保存されていない変更があります。保存しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowSaveConfirmDialog(false);
              setHasChanges(false); // 変更を破棄
              if (nextPathProceedRef.current) {
                nextPathProceedRef.current();
                nextPathProceedRef.current = null;
                nextPathRef.current = null;
              }
            }}>破棄</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await handleSaveMemo();
              setShowSaveConfirmDialog(false);
              if (nextPathProceedRef.current) {
                nextPathProceedRef.current();
                nextPathProceedRef.current = null;
                nextPathRef.current = null;
              }
            }}>保存</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Header */}
      < div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0" >
        <Button variant="ghost" size="sm" onClick={handleNewMemo} className="h-7 w-7 p-0 hover:bg-gray-100">
          <PenSquare className="w-4 h-4" />
        </Button>

        

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveMemo}
            disabled={!hasChanges || !selectedMemo}
            className="h-7 px-2 text-xs hover:bg-gray-100"
          >
            <Save className="w-3 h-3 mr-1" />
            保存
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleModeToggle}
            className={cn("h-7 px-2 text-xs hover:bg-gray-100", !isPreviewMode && "bg-gray-100")}
          >
            <Edit3 className="w-3 h-3 mr-1" />
            編集
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleModeToggle}
            className={cn("h-7 px-2 text-xs hover:bg-gray-100", isPreviewMode && "bg-gray-100")}
          >
            <Eye className="w-3 h-3 mr-1" />
            プレビュー
          </Button>
        </div>
      </div >

      {/* Editor/Preview */}
      < div className="flex-1 relative min-h-0" >
        {
          selectedMemo ? (
            <>
              {!isPreviewMode ? (
                <Textarea
                  ref={textareaRef}
                  value={localContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="メモを入力してください..."
                  className="w-full h-full resize-none border-none shadow-none text-sm leading-relaxed p-4 focus-visible:ring-0 overflow-y-auto"
                />
              ) : (
                <div
                  ref={previewRef}
                  className="w-full h-full overflow-y-auto p-4 text-sm leading-relaxed"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 text-gray-900">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold mb-1 mt-3 text-gray-800">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 text-gray-800">{children}</h3>,
                      p: ({ children }) => <p className="mb-1 leading-relaxed text-sm">{children}</p>,
                      ul: ({ children }) => <ul className="mb-2 pl-6 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 pl-6 list-decimal">{children}</ol>,
                      li: ({ children, ...props }) => {
                        // チェックボックスリストアイテムの場合
                        if (props.className?.includes('task-list-item')) {
                          return <li className="mb-0.5 text-sm list-none flex items-center" {...props}>{children}</li>;
                        }
                        return <li className="mb-0.5 text-sm" {...props}>{children}</li>;
                      },
                      input: ({ type, checked, ...props }) => {
                        if (type === 'checkbox') {
                          return <input type="checkbox" checked={checked} disabled className="mr-2 text-xs" {...props} />;
                        }
                        return <input type={type} {...props} />;
                      },
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 py-1 mb-2 text-gray-600 italic text-sm">
                          {children}
                        </blockquote>
                      ),
                      code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
                            <SyntaxHighlighter
                              style={tomorrow}
                              language={match[1]}
                              PreTag="div"
                              className="!bg-transparent !text-xs !leading-5 !font-mono overflow-x-auto"
                              customStyle={{
                                background: 'transparent',
                                fontSize: '11px',
                                lineHeight: '1.4',
                                padding: '0',
                                margin: '0'
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-300" {...props}>
                            {children}
                          </code>
                        )
                      },
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      img: ({ src, alt }) => (
                        <img src={src} alt={alt} className="max-w-full h-auto rounded mb-4" />
                      ),
                      hr: () => <hr className="border-gray-300 my-2" />,
                    }}
                  >
                    {localContent}
                  </ReactMarkdown>
                </div>
              )
              }
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">メモを選択してください</div>
          )}
      </div >
    </div >
  )
}
