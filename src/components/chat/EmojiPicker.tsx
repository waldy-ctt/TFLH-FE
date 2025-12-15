import { X as XIcon } from "lucide-react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position?: "top" | "bottom";
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👀"];

export default function EmojiPicker({ 
  onSelect, 
  onClose, 
  position = "top" 
}: EmojiPickerProps) {
  return (
    <div
      className={`absolute ${
        position === "top" ? "-top-16" : "top-full mt-2"
      } left-0 bg-white rounded-lg shadow-xl p-2 flex gap-1 z-20 border border-gray-200`}
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="text-xl hover:scale-125 transition-transform p-1 hover:bg-gray-100 rounded"
          title={emoji}
        >
          {emoji}
        </button>
      ))}
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700 p-1"
        title="Close"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}
