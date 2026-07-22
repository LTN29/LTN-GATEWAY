import { mkdir, copyFile, writeFile, rename } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { config } from "./config.mjs";
import { jsonLog } from "./utils.mjs";

let tokenCache = {
  accessToken: "",
  expiresAt: 0
};

function encodePath(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

async function graphAccessToken() {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const { tenantId, clientId, clientSecret } = config.oneDrive;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Thiếu MS_TENANT_ID, MS_CLIENT_ID hoặc MS_CLIENT_SECRET");
  }

  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form
    }
  );

  const payload = await response.json();

  if (!response.ok || !payload.access_token) {
    throw new Error(
      `Không lấy được Microsoft Graph token: ${payload.error_description || response.status}`
    );
  }

  tokenCache = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000
  };

  return tokenCache.accessToken;
}

async function syncLocal(filename, content) {
  const dir = config.oneDrive.localDir;
  if (!dir) throw new Error("Thiếu ONEDRIVE_LOCAL_DIR");

  const target = resolve(dir, filename);
  await mkdir(dirname(target), { recursive: true });

  const tmp = `${target}.${process.pid}.tmp`;
  await writeFile(tmp, content, "utf8");
  await rename(tmp, target);
}

async function syncGraph(filename, content) {
  const { driveId, folder } = config.oneDrive;
  if (!driveId) throw new Error("Thiếu ONEDRIVE_DRIVE_ID");

  const token = await graphAccessToken();
  const remotePath = encodePath(`${folder}/${filename}`);
  const url =
    `https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(driveId)}` +
    `/root:/${remotePath}:/content`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "text/markdown; charset=utf-8"
    },
    body: content
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OneDrive Graph upload lỗi ${response.status}: ${body.slice(0, 800)}`);
  }
}

export async function syncMemoryFile(filename, content) {
  const mode = config.oneDrive.mode;

  if (mode === "off") return { mode: "off", synced: false };

  try {
    if (mode === "local") {
      await syncLocal(filename, content);
    } else if (mode === "graph") {
      await syncGraph(filename, content);
    } else {
      throw new Error(`ONEDRIVE_MODE không hợp lệ: ${mode}`);
    }

    jsonLog("onedrive_sync_completed", { filename, mode });
    return { mode, synced: true };
  } catch (error) {
    jsonLog("onedrive_sync_failed", {
      filename,
      mode,
      error: error?.message || String(error)
    });
    throw error;
  }
}
