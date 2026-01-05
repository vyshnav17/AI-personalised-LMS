
// Hybrid Encryption Utilities

// 1. Generate RSA Key Pair (Identity Key)
export const generateKeys = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
    return keyPair;
};

// 2. Export / Import Keys (for storage/transmission)
export const exportKey = async (key: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey(
        key.type === "public" ? "spki" : "pkcs8",
        key
    );
    const exportedAsBase64 = window.btoa(String.fromCharCode(...new Uint8Array(exported)));
    return exportedAsBase64;
};

export const importKey = async (pem: string, type: "public" | "private"): Promise<CryptoKey> => {
    const binaryDerString = window.atob(pem);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    return await window.crypto.subtle.importKey(
        type === "public" ? "spki" : "pkcs8",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        type === "public" ? ["encrypt"] : ["decrypt"]
    );
};

// 3. Encrypt Message (Hybrid: AES + RSA)
export const encryptMessage = async (
    content: string,
    recipientPublicKeyPem: string,
    senderPublicKeyPem: string // Included just for symmetry/record, typically we encrypt KEY for sender too
) => {
    // A. Generate AES Key
    const aesKey = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    // B. Encrypt Content with AES
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encoder.encode(content)
    );

    // C. Encrypt AES Key with Recipient's Public Key (RSA)
    const recipientKey = await importKey(recipientPublicKeyPem, "public");
    const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const encryptedAesKeyForRecipient = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        recipientKey,
        exportedAesKey
    );

    // D. Encrypt AES Key with Sender's Public Key (so sender can read it later)
    const senderKey = await importKey(senderPublicKeyPem, "public");
    const encryptedAesKeyForSender = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        senderKey,
        exportedAesKey
    );

    // Return all parts
    return {
        content: window.btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
        iv: window.btoa(String.fromCharCode(...new Uint8Array(iv))),
        recipientKey: window.btoa(String.fromCharCode(...new Uint8Array(encryptedAesKeyForRecipient))),
        senderKey: window.btoa(String.fromCharCode(...new Uint8Array(encryptedAesKeyForSender))),
    };
};

// 4. Decrypt Message
export const decryptMessage = async (
    encryptedData: { content: string; iv: string; encryptedKey: string }, // encryptedKey is either senderKey or recipientKey
    privateKeyPem: string
) => {
    // A. Import Private Key
    const privateKey = await importKey(privateKeyPem, "private");

    // B. Decrypt AES Key
    const encryptedKeyBytes = new Uint8Array(window.atob(encryptedData.encryptedKey).split("").map(c => c.charCodeAt(0)));
    const aesKeyRaw = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedKeyBytes
    );
    const aesKey = await window.crypto.subtle.importKey(
        "raw",
        aesKeyRaw,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
    );

    // C. Decrypt Content
    const ivBytes = new Uint8Array(window.atob(encryptedData.iv).split("").map(c => c.charCodeAt(0)));
    const contentBytes = new Uint8Array(window.atob(encryptedData.content).split("").map(c => c.charCodeAt(0)));

    const decryptedContent = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        aesKey,
        contentBytes
    );

    return new TextDecoder().decode(decryptedContent);
};
