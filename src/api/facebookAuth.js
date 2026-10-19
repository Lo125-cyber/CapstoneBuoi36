const FACEBOOK_APP_ID = (import.meta.env.VITE_FACEBOOK_APP_ID || "").trim();
const GRAPH_API_VERSION = (
    import.meta.env.VITE_FACEBOOK_GRAPH_VERSION || "v26.0"
).trim();

let sdkPromise = null;

export function isFacebookConfigured() {
    return Boolean(
        FACEBOOK_APP_ID && FACEBOOK_APP_ID !== "YOUR_FACEBOOK_APP_ID",
    );
}

export function initializeFacebookSdk() {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return Promise.reject(
            new Error("Facebook Login chỉ hoạt động trong trình duyệt."),
        );
    }

    if (!isFacebookConfigured()) {
        return Promise.reject(
            new Error(
                "Chưa cấu hình VITE_FACEBOOK_APP_ID trong file .env.local.",
            ),
        );
    }

    if (window.FB && window.__cyberShopFacebookAppId === FACEBOOK_APP_ID) {
        return Promise.resolve(window.FB);
    }

    if (sdkPromise) return sdkPromise;

    sdkPromise = new Promise((resolve, reject) => {
        let timeoutId;

        const fail = (message) => {
            if (timeoutId) window.clearTimeout(timeoutId);
            sdkPromise = null;
            reject(new Error(message));
        };

        const initialize = () => {
            if (!window.FB) {
                fail(
                    "Không thể tải Facebook SDK. Hãy kiểm tra kết nối mạng hoặc trình chặn quảng cáo.",
                );
                return;
            }

            try {
                window.FB.init({
                    appId: FACEBOOK_APP_ID,
                    cookie: true,
                    xfbml: false,
                    version: GRAPH_API_VERSION,
                });
                window.__cyberShopFacebookAppId = FACEBOOK_APP_ID;
                if (timeoutId) window.clearTimeout(timeoutId);
                resolve(window.FB);
            } catch {
                fail(
                    "Không thể khởi tạo Facebook SDK. Hãy kiểm tra App ID và cấu hình ứng dụng Meta.",
                );
            }
        };

        window.fbAsyncInit = initialize;
        timeoutId = window.setTimeout(() => {
            fail(
                "Facebook SDK tải quá lâu. Vui lòng tải lại trang và thử lại.",
            );
        }, 20000);

        const existingScript = document.getElementById("facebook-jssdk");
        if (existingScript) {
            if (window.FB) initialize();
            return;
        }

        const script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.src = "https://connect.facebook.net/vi_VN/sdk.js";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.onerror = () => {
            fail("Không thể tải Facebook SDK. Hãy kiểm tra kết nối mạng.");
        };
        document.head.appendChild(script);
    });

    return sdkPromise;
}

export function requestFacebookAccessToken() {
    return new Promise((resolve, reject) => {
        if (
            typeof window === "undefined" ||
            !window.FB ||
            window.__cyberShopFacebookAppId !== FACEBOOK_APP_ID
        ) {
            reject(
                new Error(
                    "Facebook SDK chưa sẵn sàng. Vui lòng chờ tải xong rồi thử lại.",
                ),
            );
            return;
        }

        window.FB.login(
            (response) => {
                const accessToken = response?.authResponse?.accessToken;
                if (accessToken) {
                    resolve(accessToken);
                } else {
                    reject(
                        new Error(
                            "Bạn đã hủy đăng nhập Facebook hoặc Facebook không cấp quyền truy cập.",
                        ),
                    );
                }
            },
            { scope: "public_profile,email" },
        );
    });
}
