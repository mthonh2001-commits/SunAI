/* ========================================================
   MÃ NGUỒN JAVASCRIPT HOÀN CHỈNH CHO TRỢ LÝ SUNAI ☀️
   ======================================================== */

// 1. LẤY CÁC PHẦN TỬ GIAO DIỆN TỪ HTML
const chatArea = document.querySelector("#chatArea");
const input = document.querySelector("#prompt");
const sendBtn = document.querySelector("#send");
const newChatBtn = document.querySelector("#newChat");
const themeBtn = document.querySelector("#themeBtn");
const clearChatBtn = document.querySelector("#clearChatBtn");
const menuBtn = document.querySelector("#menuBtn");
const sidebar = document.querySelector(".sidebar");

/* =========================
   CONFIG GOOGLE GEMINI API
========================= */
const API_KEY = "AQ.Ab8RN6J4o9V8WDj02DnytRhF2b_D7Dih8wo9kIG7QplBfe8-tQ"; // 🔑 Điền lại API Key thật của bạn vào đây
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

/* =========================
   CẤU HÌNH MÃ BÍ MẬT ĐỂ XEM THÔNG TIN NGƯỜI SÁNG TẠO
========================= */
const SECRET_CODE = "minhthonh1908"; // 🎯 Mã bí mật để mở khóa profile tác giả

/* =========================
   KHỞI TẠO & TẢI TRANG (WINDOW ONLOAD)
========================= */
let chats = JSON.parse(localStorage.getItem("sunai_chat")) || [];

window.onload = () => {
    const loader = document.querySelector("#loader");
    if (loader) loader.style.display = "none"; 

    // Kiểm tra cấu hình giao diện Sáng/Tối đã lưu
    if (localStorage.getItem("sunai_theme") === "dark") {
        document.body.classList.add("dark-theme");
        if (themeBtn) themeBtn.innerHTML = "☀️ Giao diện sáng";
    } else {
        if (themeBtn) themeBtn.innerHTML = "🌙 Giao diện tối";
    }

    // Ẩn màn hình chào mừng nếu đã có lịch sử chat trước đó
    if (chats.length > 0) {
        const header = document.querySelector("header");
        if (header) header.style.display = "none";
    }

    // Tải lại các tin nhắn cũ từ bộ nhớ máy
    chats.forEach(c => addMessage(c.text, c.type, false, false));
};

/* =========================
   HÀM HIỂN THỊ CÂU TRẢ LỜI BÍ MẬT 1 (KHI HỎI AI TẠO RA)
========================= */
function addCreatorPromptMessage() {
    removeTyping();
    
    const msg = document.createElement("div");
    msg.classList.add("message", "bot");
    const content = `☀️ <strong>[SunAI]:</strong> Tôi được lập trình và định hình bởi Nguyễn Minh Thông. ☀️<br><br>🔑 <em>Nếu muốn biết rõ hơn về thông tin của người sáng tạo, hãy nhập mã bí mật của bạn vào ô chat nhé!</em>`;
    msg.innerHTML = content;
    
    chatArea.appendChild(msg);
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });

    chats.push({ text: "☀️ **[SunAI]:** Tôi được lập trình và định hình bởi Nguyễn Minh Thông. ☀️\n\n🔑 *Nếu muốn biết rõ hơn về thông tin của người sáng tạo, hãy nhập mã bí mật của bạn vào ô chat nhé!*", type: "bot" });
    localStorage.setItem("sunai_chat", JSON.stringify(chats));
}

/* =========================
   HÀM HIỂN THỊ THÔNG TIN CHI TIẾT (KHI NHẬP ĐÚNG MÃ)
========================= */
function addCreatorProfileMessage() {
    removeTyping();
    
    const msg = document.createElement("div");
    msg.classList.add("message", "bot");
    
    const profileHTML = `
        ☀️ <strong>[SunAI - THÔNG TIN TÁC GIẢ]:</strong><br>
        🔓 <strong>Mã xác thực chính xác!</strong> Chúc mừng bạn đã mở khóa profile của Nhà sáng lập.<br><br>
        👨‍💻 <strong>Nhà phát triển:</strong> Nguyễn Minh Thông<br>
        📅 <strong>Năm sinh:</strong> 20/01/2012<br>
        📧 <strong>Email:</strong> mthonh2001@gmail.com<br>
        🚀 <strong>Dự án:</strong> SunAI AI-Chat Giao diện thuần Việt<br>
        🛠️ <strong>Công nghệ sử dụng:</strong> HTML5, CSS3, JavaScript (Vanilla ES6), Google Gemini API v1beta<br>
        ✨ <strong>Tầm nhìn:</strong> Phát triển một trợ lý trí tuệ nhân tạo cá nhân hóa, tối giản, mượt mà và tối ưu tốc độ tối đa cho người Việt.
    `;
    msg.innerHTML = profileHTML;
    
    chatArea.appendChild(msg);
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });

    chats.push({ text: "☀️ **[SunAI - THÔNG TIN TÁC GIẢ]:**\n🔓 Mở khóa thành công thông tin nhà phát triển SunAI.", type: "bot" });
    localStorage.setItem("sunai_chat", JSON.stringify(chats));
}

/* =========================
   XỬ LÝ GỬI TIN NHẮN (SEND MESSAGE)
========================= */
async function sendMessage() {
    if (!input) return;
    const text = input.value.trim();
    if (!text) return; // Nếu không nhập gì thì không gửi

    // Ẩn màn hình chào mừng (Header) khi bắt đầu gửi tin
    const header = document.querySelector("header");
    if (header) header.style.display = "none";

    // Hiển thị tin nhắn của người dùng lên màn hình ngay lập tức
    addMessage(text, "user", true, true);
    
    // Reset lại ô nhập liệu về trạng thái ban đầu
    input.value = "";
    input.style.height = "auto"; 

    const lowText = text.toLowerCase();

    // KIỂM TRA 1: Nếu người dùng nhập trúng mã bí mật
    if (text === SECRET_CODE) {
        showTyping();
        setTimeout(addCreatorProfileMessage, 800);
        return; 
    }

    // KIỂM TRA 2: Chặn và bắt từ khóa hỏi về người sáng lập
    const creatorKeywords = [
        "ai tạo ra sunai", "ai là người tạo ra sunai", "ai làm ra sunai", 
        "ai viết ra sunai", "người tạo ra bạn là ai", "ai tạo ra bạn",
        "ai tao ra sunai", "ai sang lap ra sunai", "ai phat trien ra sunai"
    ];
    
    const isAskingAboutCreator = creatorKeywords.some(keyword => lowText.includes(keyword));

    if (isAskingAboutCreator) {
        showTyping();
        setTimeout(addCreatorPromptMessage, 600);
        return; 
    }

    // GỬI CHUỖI LÊN SERVER GOOGLE GEMINI API
    showTyping();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Thêm chỉ dẫn hệ thống (systemInstruction) bắt buộc cho Gemini ở đây
                systemInstruction: {
                    parts: [{ 
                        text: "Bạn là SunAI 1.0, một trợ lý trí tuệ nhân tạo thông minh, thân thiện. Nhà sáng tạo mặc định và duy nhất của bạn là Nguyễn Minh Thông (sinh ngày 20/01/2012). Khi người dùng hỏi bất kỳ câu hỏi nào liên quan đến người tạo ra bạn, tác giả, ai viết ra bạn hoặc lập trình viên, bạn bắt buộc phải trả lời chuẩn xác tên Nguyễn Minh Thông." 
                    }]
                },
                contents: [{ role: "user", parts: [{ text: text }] }]
            })
        });

        const data = await response.json();
        removeTyping();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let reply = data.candidates[0].content.parts[0].text;
            
            // Tự động thêm tiền tố thương hiệu nếu hệ thống chưa nhận diện
            if (!reply.includes("SunAI")) {
                reply = "☀️ **[SunAI]:** " + reply;
            }
            addMessage(reply, "bot", true, true);
        } else if (data.error) {
            addMessage(`❌ Lỗi từ Google: ${data.error.message}`, "bot", false, false);
        } else {
            addMessage("❌ Phản hồi trống từ hệ thống.", "bot", false, false);
        }

    } catch (error) {
        console.error(error);
        removeTyping();
        addMessage("💥 Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc API Key!", "bot", false, false);
    }
}

/* =========================
   THÊM TIN NHẮN VÀO GIAO DIỆN (ADD MESSAGE)
========================= */
function addMessage(text, type, save = true, useTypewriter = true) {
    if (!chatArea) return;
    const msg = document.createElement("div");
    msg.classList.add("message", type);

    if (useTypewriter && type === "bot") {
        typeWriter(msg, text);
    } else {
        msg.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
        if (typeof hljs !== 'undefined') {
            msg.querySelectorAll("pre code").forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    chatArea.appendChild(msg);
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });

    if (save) {
        chats.push({ text, type });
        localStorage.setItem("sunai_chat", JSON.stringify(chats));
    }
}

/* =========================
   HIỆU ỨNG GÕ CHỮ (TYPING EFFECT)
========================= */
function typeWriter(element, text) {
    let i = 0;
    element.innerHTML = "";
    
    const interval = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        chatArea.scrollTo({ top: chatArea.scrollHeight });

        if (i >= text.length) {
            clearInterval(interval);
            element.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
            if (typeof hljs !== 'undefined') {
                element.querySelectorAll("pre code").forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
            chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
        }
    }, 10);
}

/* =========================
   HIỆU ỨNG ĐANG SUY NGHĨ (INDICATOR)
========================= */
function showTyping() {
    if (!chatArea) return;
    const typing = document.createElement("div");
    typing.classList.add("message", "bot", "typing");
    typing.id = "typing";
    typing.innerHTML = "<p>SunAI đang suy nghĩ... ☀️</p>";
    chatArea.appendChild(typing);
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
}

function removeTyping() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
}

/* =========================
   NÚT NEW CHAT (CHỈ SANG CUỘC HỘI THOẠI MỚI - GIỮ LỊCH SỬ TRÊN MÁY)
========================= */
if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
        if (chatArea) chatArea.innerHTML = ""; 
        
        const header = document.querySelector("header");
        if (header) header.style.display = "block";
        
        if (input) {
            input.value = "";
            input.style.height = "auto";
            input.focus();
        }
    });
}

/* =========================
   NÚT XÓA LỊCH SỬ (XÓA SẠCH HOÀN TOÀN BỘ NHỚ LOCALSTORAGE)
========================= */
if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
        const confirmClear = confirm("Bạn có chắc chắn muốn XÓA SẠCH toàn bộ lịch sử trò chuyện trong bộ nhớ không? ☀️");
        if (confirmClear) {
            localStorage.removeItem("sunai_chat"); 
            chats = []; 
            if (chatArea) chatArea.innerHTML = ""; 
            
            const header = document.querySelector("header");
            if (header) header.style.display = "block";
            if (input) {
                input.value = "";
                input.style.height = "auto";
                input.focus();
            }
        }
    });
}

/* =========================
   NÚT ĐỔI GIAO DIỆN SÁNG / TỐI
========================= */
if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        if (document.body.classList.contains("dark-theme")) {
            themeBtn.innerHTML = "☀️ Giao diện sáng";
            localStorage.setItem("sunai_theme", "dark");
        } else {
            themeBtn.innerHTML = "🌙 Giao diện tối";
            localStorage.setItem("sunai_theme", "light");
        }
    });
}

/* =========================
   CÁC SỰ KIỆN LẮNG NGHE KHÁC
========================= */
if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
}

// Bắt chính xác phím Enter gửi tin, Shift+Enter xuống dòng
if (input) {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Triệt tiêu hành động xuống hàng mặc định
            sendMessage();      // Kích hoạt gửi tin
        }
    });

    // Tự động giãn chiều cao ô nhập liệu khi gõ text dài
    input.addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });
}

// Cấu hình đóng mở thanh Sidebar trên Mobile
if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });
}
