import React from "react";

function SkinChat() {
  return (
    <div>
      <h2>Skin AI Assistant</h2>
      <p>Take or upload a photo of the affected area</p>
      <input type="file" accept="image/*" />
      <button>📷 Capture with Camera</button>
    </div>
  );
}

export default SkinChat;
