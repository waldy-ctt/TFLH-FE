import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useMessages } from "@/hooks/useMessages";
import { Message } from "@/types";
import { Smile, Reply, Trash2, X as XIcon } from "lucide-react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

interface MessageItemProps {
  message: Message;
  index: number;
}

export default function MessageItem({ message, index }: MessageItemProps) {
  const { user } = useAppContext();
  const { deleteMessage, reactToMessage } = useMessages();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isOwnMessage = message.user_id === user?.id;

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
      <div
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
        }`}
      >
        <div className="relative max-w-[85%] sm:max-w-xs">
          <div
            className={`px-3 sm:px-4 py-2 rounded-2xl shadow-md ${
              isOwnMessage
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                : "bg-white text-gray-900 rounded-bl-none"
            }`}
          >
            <p className="text-xs opacity-70 mb-1 font-medium">
              {message.username}
            </p>
            <p className="break-words text-sm sm:text-base">
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
                  }, {})
                ).map(([emoji, users]) => (
                  <span
                    key={emoji}
                    className={`text-xs px-2 py-1 rounded-full ${
                      isOwnMessage ? "bg-white/20" : "bg-gray-100"
                    }`}
                    title={(users as string[]).join(", ")}
                  >
                    {emoji} {(users as string[]).length}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Message Actions */}
          {(index > 0 || isOwnMessage) && (
            <div
              className={`absolute ${
                isOwnMessage ? "left-0 -translate-x-full" : "right-0 translate-x-full"
              } top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white rounded-lg shadow-lg p-1 border border-gray-200 z-10 ml-2 mr-2`}
            >
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                title="React"
              >
                <Smile size={16} />
              </button>
              <button
                onClick={() => {/* setReplyTo(message) - need to pass this from parent */}}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                title="Reply"
              >
                <Reply size={16} />
              </button>
              {isOwnMessage && (
                <button
                  onClick={() => deleteMessage(message.id)}
                  className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute -top-16 left-0 bg-white rounded-lg shadow-xl p-2 flex gap-1 z-20 border border-gray-200">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    reactToMessage(message.id, emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <XIcon size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
