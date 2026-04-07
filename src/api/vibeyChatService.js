/**
 * vibeyChatService.js
 * ═══════════════════════════════════════════════════════════════
 * Handles Django Proxy endpoints for Vibey chat sessions.
 * ═══════════════════════════════════════════════════════════════
 */

const BASE_URL = "http://127.0.0.1:8000/api/chat";

const getAuthHeaders = async (currentUser) => {
    if (!currentUser) return null;
    try {
        const token = await currentUser.getIdToken();
        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    } catch (e) {
        return null;
    }
};

export const autoTitleChat = (firstMessage) => {
    if (!firstMessage) return 'New Chat';
    const cleaned = firstMessage.replace(/\n/g, ' ').trim();
    if (cleaned.length <= 40) return cleaned;
    return cleaned.substring(0, 40).trim() + '…';
};

export const getUserChats = async (currentUser) => {
    const headers = await getAuthHeaders(currentUser);
    if (!headers) return [];
    try {
        const res = await fetch(`${BASE_URL}/list/`, { headers });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error('[VibeyChatService] Error fetching chats:', e);
    }
    return [];
};

export const getChatById = async (currentUser, chatId) => {
    const headers = await getAuthHeaders(currentUser);
    if (!headers || !chatId) return null;
    try {
        const res = await fetch(`${BASE_URL}/${chatId}/`, { headers });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error('[VibeyChatService] Error fetching chat:', e);
    }
    return null;
};



export const updateChatMessages = async (currentUser, chatId, messages, title) => {
    const headers = await getAuthHeaders(currentUser);
    if (!headers || !chatId) return;
    try {
        const payload = { messages };
        if (title !== undefined) payload.title = title;

        await fetch(`${BASE_URL}/${chatId}/update/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error('[VibeyChatService] Error updating messages:', e);
    }
};

export const renameChat = async (currentUser, chatId, newTitle) => {
    const headers = await getAuthHeaders(currentUser);
    if (!headers || !chatId || !newTitle) return;
    try {
        await fetch(`${BASE_URL}/${chatId}/update/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ title: newTitle })
        });
    } catch (e) {
        console.error('[VibeyChatService] Error renaming chat:', e);
    }
};

export const deleteChatById = async (currentUser, chatId) => {
    const headers = await getAuthHeaders(currentUser);
    if (!headers || !chatId) return;
    try {
        await fetch(`${BASE_URL}/${chatId}/delete/`, {
            method: 'DELETE',
            headers
        });
    } catch (e) {
        console.error('[VibeyChatService] Error deleting chat:', e);
    }
};

export const sendMessage = async (currentUser, chatId, description) => {
    const headers = await getAuthHeaders(currentUser);
    if (!headers) return null;
    try {
        const payload = { description };
        if (chatId) payload.chat_id = chatId;

        const res = await fetch(`${BASE_URL}/message/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        if (res.ok) {
           return await res.json();
        }
    } catch (e) {
        console.error('[VibeyChatService] Error sending message:', e);
    }
    return null;
};
