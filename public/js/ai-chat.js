/**
 * ==========================================================================
 * LOGIC WIDGET TRỢ LÝ AI GOOGLE GEMINI TƯ VẤN ĐỒNG HỒ (CHRONOAI RAG)
 * Học phần: Lập Trình Ứng Dụng - Chuyên Ngành TMĐT - ĐH Lạc Hồng
 * ==========================================================================
 */

let isChatOpen = false;

function toggleAIChat() {
  const windowEl = document.getElementById("aiChatWindow");
  if (!windowEl) return;

  isChatOpen = !isChatOpen;
  if (isChatOpen) {
    windowEl.classList.remove("hidden");
    document.getElementById("aiInput")?.focus();
  } else {
    windowEl.classList.add("hidden");
  }
}

async function sendAIMessage(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("aiInput");
  const messagesContainer = document.getElementById("aiMessages");
  if (!input || !messagesContainer) return;

  const text = input.value.trim();
  if (!text) return;

  // 1. Render tin nhắn câu hỏi của khách hàng
  appendMessage(text, "user");
  input.value = "";

  // 2. Render trạng thái "AI đang suy nghĩ..."
  const typingId = "typing-" + Date.now();
  const typingEl = document.createElement("div");
  typingEl.className = "msg msg-ai";
  typingEl.id = typingId;
  typingEl.innerHTML = `<em>🤖 ChronoAI đang tra cứu cơ sở dữ liệu đồng hồ...</em>`;
  messagesContainer.appendChild(typingEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // 3. Gọi Endpoint Backend POST /api/ai/chat (Kỹ thuật RAG)
  const res = await API.askAI(text);

  // 4. Xóa trạng thái gõ và hiển thị phản hồi từ Gemini RAG
  const activeTyping = document.getElementById(typingId);
  if (activeTyping) activeTyping.remove();

  const replyText = res.success
    ? res.reply
    : res.message ||
      "Dạ xin lỗi Quý khách, trợ lý AI đang bận xử lý dữ liệu. Quý khách vui lòng thử lại câu hỏi khác nhé!";
  appendMessage(replyText, "ai");
}

function appendMessage(text, sender) {
  const messagesContainer = document.getElementById("aiMessages");
  if (!messagesContainer) return;

  const msg = document.createElement("div");
  msg.className = `msg ${sender === "user" ? "msg-user" : "msg-ai"}`;

  // Định dạng hiển thị xuống dòng và in đậm markdown
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

  msg.innerHTML = formatted;
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
