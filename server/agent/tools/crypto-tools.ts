import { Tool, ToolResult } from "./registry";
import * as crypto from "crypto";

export const encryptAesTool: Tool = {
  name: "encrypt_aes",
  description: "Encrypt text using AES-256-CBC",
  category: "crypto",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to encrypt",
      required: true,
    },
    {
      name: "key",
      type: "string",
      description: "Encryption key (32 characters)",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { text, key } = params;

      if (key.length !== 32) {
        throw new Error("Key must be 32 characters");
      }

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);

      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");

      const result = iv.toString("hex") + ":" + encrypted;

      return {
        success: true,
        result,
        metadata: {
          algorithm: "aes-256-cbc",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const decryptAesTool: Tool = {
  name: "decrypt_aes",
  description: "Decrypt AES-256-CBC encrypted text",
  category: "crypto",
  parameters: [
    {
      name: "encrypted",
      type: "string",
      description: "Encrypted text (iv:ciphertext format)",
      required: true,
    },
    {
      name: "key",
      type: "string",
      description: "Decryption key (32 characters)",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { encrypted, key } = params;

      if (key.length !== 32) {
        throw new Error("Key must be 32 characters");
      }

      const parts = encrypted.split(":");
      const iv = Buffer.from(parts[0], "hex");
      const encryptedText = parts[1];

      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(key),
        iv
      );

      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return {
        success: true,
        result: decrypted,
        metadata: {
          algorithm: "aes-256-cbc",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const generateKeyTool: Tool = {
  name: "generate_key",
  description: "Generate random encryption key",
  category: "crypto",
  parameters: [
    {
      name: "length",
      type: "number",
      description: "Key length in bytes (default: 32)",
      required: false,
    },
    {
      name: "format",
      type: "string",
      description: "Output format: hex, base64 (default: hex)",
      required: false,
      enum: ["hex", "base64"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { length = 32, format = "hex" } = params;
      const key = crypto.randomBytes(length);

      const result =
        format === "base64" ? key.toString("base64") : key.toString("hex");

      return {
        success: true,
        result,
        metadata: {
          length,
          format,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const hmacTool: Tool = {
  name: "hmac",
  description: "Generate HMAC signature",
  category: "crypto",
  parameters: [
    {
      name: "data",
      type: "string",
      description: "Data to sign",
      required: true,
    },
    {
      name: "secret",
      type: "string",
      description: "Secret key",
      required: true,
    },
    {
      name: "algorithm",
      type: "string",
      description: "Hash algorithm (default: sha256)",
      required: false,
      enum: ["sha1", "sha256", "sha512"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { data, secret, algorithm = "sha256" } = params;

      const hmac = crypto.createHmac(algorithm, secret);
      hmac.update(data);
      const signature = hmac.digest("hex");

      return {
        success: true,
        result: signature,
        metadata: {
          algorithm,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const verifyHmacTool: Tool = {
  name: "verify_hmac",
  description: "Verify HMAC signature",
  category: "crypto",
  parameters: [
    {
      name: "data",
      type: "string",
      description: "Original data",
      required: true,
    },
    {
      name: "signature",
      type: "string",
      description: "HMAC signature to verify",
      required: true,
    },
    {
      name: "secret",
      type: "string",
      description: "Secret key",
      required: true,
    },
    {
      name: "algorithm",
      type: "string",
      description: "Hash algorithm (default: sha256)",
      required: false,
      enum: ["sha1", "sha256", "sha512"],
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { data, signature, secret, algorithm = "sha256" } = params;

      const hmac = crypto.createHmac(algorithm, secret);
      hmac.update(data);
      const expectedSignature = hmac.digest("hex");

      const isValid = signature === expectedSignature;

      return {
        success: true,
        result: isValid ? "Valid" : "Invalid",
        metadata: {
          valid: isValid,
          algorithm,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const pbkdf2Tool: Tool = {
  name: "pbkdf2",
  description: "Derive key using PBKDF2",
  category: "crypto",
  parameters: [
    {
      name: "password",
      type: "string",
      description: "Password",
      required: true,
    },
    {
      name: "salt",
      type: "string",
      description: "Salt",
      required: true,
    },
    {
      name: "iterations",
      type: "number",
      description: "Iterations (default: 100000)",
      required: false,
    },
    {
      name: "keylen",
      type: "number",
      description: "Key length (default: 32)",
      required: false,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const {
        password,
        salt,
        iterations = 100000,
        keylen = 32,
      } = params;

      const derived = crypto.pbkdf2Sync(
        password,
        salt,
        iterations,
        keylen,
        "sha512"
      );

      return {
        success: true,
        result: derived.toString("hex"),
        metadata: {
          iterations,
          keylen,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const jwtSignTool: Tool = {
  name: "jwt_sign",
  description: "Create JWT token (simple implementation)",
  category: "crypto",
  parameters: [
    {
      name: "payload",
      type: "string",
      description: "JSON payload",
      required: true,
    },
    {
      name: "secret",
      type: "string",
      description: "Secret key",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { payload, secret } = params;

      const header = { alg: "HS256", typ: "JWT" };
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
        "base64url"
      );
      const encodedPayload = Buffer.from(payload).toString("base64url");

      const signature = crypto
        .createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64url");

      const token = `${encodedHeader}.${encodedPayload}.${signature}`;

      return {
        success: true,
        result: token,
        metadata: {
          algorithm: "HS256",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export const jwtVerifyTool: Tool = {
  name: "jwt_verify",
  description: "Verify JWT token (simple implementation)",
  category: "crypto",
  parameters: [
    {
      name: "token",
      type: "string",
      description: "JWT token",
      required: true,
    },
    {
      name: "secret",
      type: "string",
      description: "Secret key",
      required: true,
    },
  ],
  execute: async (params, context): Promise<ToolResult> => {
    try {
      const { token, secret } = params;

      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      const [encodedHeader, encodedPayload, signature] = parts;

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64url");

      const isValid = signature === expectedSignature;

      const payload = isValid
        ? Buffer.from(encodedPayload, "base64url").toString()
        : null;

      return {
        success: true,
        result: isValid ? `Valid. Payload: ${payload}` : "Invalid signature",
        metadata: {
          valid: isValid,
          payload,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
