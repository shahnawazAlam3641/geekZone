import { useState } from "react";

const MessageContent = ({ content }: { content: string }) => {
  const [showFull, setShowFull] = useState(false);

  const toggleShow = () => setShowFull(!showFull);

  if (content.length <= 150) {
    return <p>{content}</p>;
  }

  return (
    <div>
      <p className="break-words">
        {showFull ? content : content.slice(0, 150) + "..."}
      </p>
      <button
        onClick={toggleShow}
        className="text-xs text-blue-400 hover:underline mt-1 cursor-pointer"
      >
        {showFull ? "Read less" : "Read more"}
      </button>
    </div>
  );
};

export default MessageContent;
