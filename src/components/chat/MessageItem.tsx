import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useMessages } from "@/hooks/useMessages";
import { Message } from "@/types";
import { Reply, Trash2 } from "lucide-react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

interface MessageItemProps {
  message: Message;
  index: number;
}

export default function MessageItem({ message }: MessageItemProps) {
  const { user } = useAppContext();
  const { deleteMessage, reactToMessage } = useMessages();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);

  console.log(showEmojiPicker);

  const isOwnMessage = message.user_id === user?.id;

  const handleLongPress = () => {
    if (!message.is_system) {
      setShowActions(true);
    }
  };

  const handleReaction = async (emoji: string) => {
    await reactToMessage(message.id, emoji);
    setShowEmojiPicker(false);
    setShowActions(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this message?")) {
      await deleteMessage(message.id);
    }
    setShowActions(false);
  };

  // System message
  if (message.is_system) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full max-w-[80%] text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      {/* Reply Context */}
      {message.reply_to && (
        <div
          className={`mb-2 text-xs p-2 rounded-lg bg-white border-l-4 border-blue-400 shadow-sm ${
            isOwnMessage ? "ml-auto mr-2" : "ml-2 mr-auto"
          }`}
          style={{ maxWidth: "280px" }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Reply size={12} className="text-blue-600" />
            <span className="font-semibold text-blue-700">
              {message.reply_to.username}
            </span>
          </div>
          <div className="text-gray-600 line-clamp-2 text-xs">
            {message.reply_to.content}
          </div>
        </div>
      )}

      {/* Message */}
      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
        <div className="relative max-w-[85%] sm:max-w-xs">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-md active:scale-98 transition-transform touch-manipulation ${
              isOwnMessage
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                : "bg-white text-gray-900 rounded-bl-none"
            }`}
            onTouchStart={(e) => {
              const timer = setTimeout(handleLongPress, 500);
              (e.currentTarget as any)._longPressTimer = timer;
            }}
            onTouchEnd={(e) => {
              clearTimeout((e.currentTarget as any)._longPressTimer);
            }}
            onTouchMove={(e) => {
              clearTimeout((e.currentTarget as any)._longPressTimer);
            }}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <p className="text-xs opacity-70 mb-1 font-medium">
              {message.username}
            </p>
            <p className="break-words text-base leading-relaxed">
              {message.content}
            </p>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(
                  message.reactions.reduce((acc: any, r) => {
                    acc[r.emoji] = acc[r.emoji] || [];
                    acc[r.emoji].push(r.username);
                    return acc;
                  }, {}),
                ).map(([emoji, users]) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`text-sm px-2 py-1 rounded-full active:scale-95 transition-transform ${
                      isOwnMessage ? "bg-white/20" : "bg-gray-100"
                    }`}
                    title={(users as string[]).join(", ")}
                    type="button"
                    style={{
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {emoji} {(users as string[]).length}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Actions Menu (Android optimized) */}
          {showActions && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowActions(false)}
                onTouchEnd={() => setShowActions(false)}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
              />

              {/* Actions Menu */}
              <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 z-50 animate-slide-up">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Emoji Picker */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">React</p>
                  <div className="flex gap-2 justify-around">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="text-3xl p-2 active:scale-110 transition-transform"
                        type="button"
                        style={{
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {isOwnMessage && (
                    <button
                      onClick={handleDelete}
                      className="w-full p-4 text-red-600 font-medium rounded-lg active:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      type="button"
                      style={{
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <Trash2 size={18} />
                      Delete Message
                    </button>
                  )}
                  <button
                    onClick={() => setShowActions(false)}
                    className="w-full p-4 text-gray-700 font-medium rounded-lg active:bg-gray-100 transition-colors"
                    type="button"
                    style={{
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* Add to your CSS */
const style = document.createElement("style");
style.textContent = `
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`;
if (typeof document !== "undefined") {
  document.head.appendChild(style);
}
