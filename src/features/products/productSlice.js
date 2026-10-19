import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../../api/api";

function unwrapPayload(data) {
    let payload = data;
    for (let i = 0; i < 4 && payload && !Array.isArray(payload); i += 1) {
        if (payload.content !== undefined) payload = payload.content;
        else if (payload.result !== undefined) payload = payload.result;
        else if (payload.data !== undefined) payload = payload.data;
        else break;
    }
    return payload;
}

function normalizeProduct(product) {
    if (!product || typeof product !== "object") return product;

    const rawImage =
        product.image ??
        product.imageUrl ??
        product.img ??
        product.hinhAnh ??
        "";
    const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "https://shop.cyberlearn.vn";
    let image = rawImage;

    if (typeof rawImage === "string" && rawImage.startsWith("/")) {
        image = `${apiBaseUrl.replace(/\/$/, "")}${rawImage}`;
    }
    if (!image) image = "/product-placeholder.svg";

    return {
        ...product,
        id: product.id ?? product.productId ?? product.productID ?? product.ID,
        name:
            product.name ??
            product.productName ??
            product.tenSanPham ??
            "Sản phẩm chưa có tên",
        image,
        price: product.price ?? product.gia ?? 0,
        description: product.description ?? product.moTa ?? "",
        shortDescription:
            product.shortDescription ?? product.short_description ?? "",
        size: Array.isArray(product.size)
            ? product.size
            : Array.isArray(product.sizes)
              ? product.sizes
              : [],
    };
}

function findArray(data, possibleKeys = []) {
    const visited = new Set();
    const queue = [data];
    const wrapperKeys = ["content", "result", "data", ...possibleKeys];

    while (queue.length) {
        const current = queue.shift();
        if (!current || typeof current !== "object" || visited.has(current))
            continue;
        visited.add(current);
        if (Array.isArray(current)) return current;

        for (const key of wrapperKeys) {
            if (current[key] !== undefined && current[key] !== null) {
                if (Array.isArray(current[key])) return current[key];
                if (typeof current[key] === "object") queue.push(current[key]);
            }
        }
    }

    return [];
}

function extractProductList(data) {
    return findArray(data, [
        "products",
        "items",
        "productList",
        "productsFavorite",
    ]).map((item) => {
        const product = item?.product ?? item?.productInfo ?? item;
        const normalized = normalizeProduct(product);
        if (
            product === item &&
            item?.productId != null &&
            item?.id != null &&
            item?.name == null &&
            item?.productName == null
        ) {
            return normalizeProduct({ ...item, id: item.productId });
        }
        return normalized;
    });
}

function extractSingleProduct(data) {
    const payload = unwrapPayload(data);
    const product = payload?.product ?? payload?.item ?? payload;
    if (!product || typeof product !== "object" || Array.isArray(product))
        return null;
    return normalizeProduct(product);
}

function loadCartFromStorage() {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem("cybershop_cart");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveCartToStorage(cartItems) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(
            "cybershop_cart",
            JSON.stringify(cartItems),
        );
    } catch (e) {
        console.error("Không thể lưu giỏ hàng:", e);
    }
}

export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/api/Product");
            if (
                response.data?.statusCode >= 400 ||
                response.data?.success === false
            ) {
                return rejectWithValue(
                    response.data?.message ||
                        "Không thể tải danh sách sản phẩm.",
                );
            }
            return extractProductList(response.data);
        } catch (error) {
            return rejectWithValue(
                getApiErrorMessage(
                    error,
                    "Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối API.",
                ),
            );
        }
    },
);

export const fetchProductById = createAsyncThunk(
    "products/fetchProductById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get("/api/Product/getbyid", {
                params: { id },
            });
            if (
                response.data?.statusCode >= 400 ||
                response.data?.success === false
            ) {
                return rejectWithValue(
                    response.data?.message ||
                        "Không thể tải chi tiết sản phẩm.",
                );
            }

            const product = extractSingleProduct(response.data);
            if (!product || product.id == null) {
                return rejectWithValue(
                    "Không tìm thấy sản phẩm này. Hãy kiểm tra mã sản phẩm trong đường dẫn.",
                );
            }
            return product;
        } catch (error) {
            return rejectWithValue(
                getApiErrorMessage(
                    error,
                    "Không thể tải chi tiết sản phẩm. Vui lòng thử lại.",
                ),
            );
        }
    },
);

export const fetchFavoriteProducts = createAsyncThunk(
    "products/fetchFavoriteProducts",
    async (_, { rejectWithValue }) => {
        try {
            const token =
                typeof window !== "undefined"
                    ? window.localStorage.getItem("accessToken")
                    : null;

            if (!token) {
                return rejectWithValue(
                    "Bạn cần đăng nhập để xem danh sách sản phẩm yêu thích.",
                );
            }

            const response = await api.get("/api/Users/getproductfavorite");
            if (
                response.data?.statusCode >= 400 ||
                response.data?.success === false
            ) {
                return rejectWithValue(
                    response.data?.message ||
                        "Không thể tải danh sách yêu thích.",
                );
            }

            return extractProductList(response.data);
        } catch (error) {
            return rejectWithValue(
                getApiErrorMessage(
                    error,
                    "Không thể tải danh sách yêu thích. Vui lòng thử lại.",
                ),
            );
        }
    },
);

export const toggleFavoriteProduct = createAsyncThunk(
    "products/toggleFavoriteProduct",
    async ({ product, isLiked }, { rejectWithValue }) => {
        try {
            const token =
                typeof window !== "undefined"
                    ? window.localStorage.getItem("accessToken")
                    : null;

            if (!token) {
                return rejectWithValue(
                    "Bạn cần đăng nhập để thực hiện thao tác này.",
                );
            }

            const endpoint = isLiked ? "/api/Users/like" : "/api/Users/unlike";
            const response = await api.get(endpoint, {
                params: { productId: product.id },
            });

            if (
                response.data?.statusCode >= 400 ||
                response.data?.success === false
            ) {
                return rejectWithValue(
                    response.data?.message ||
                        "Không thể cập nhật trạng thái yêu thích.",
                );
            }

            return { product: normalizeProduct(product), isLiked };
        } catch (error) {
            return rejectWithValue(
                getApiErrorMessage(
                    error,
                    "Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.",
                ),
            );
        }
    },
);

export const submitOrder = createAsyncThunk(
    "products/submitOrder",
    async (
        { email, selectedItems },
        { dispatch, getState, rejectWithValue },
    ) => {
        try {
            const itemsToOrder = selectedItems || [];
            const stateEmail = getState()?.products?.userProfile?.email;
            const finalEmail = stateEmail || resolveUserEmail(email);

            if (!finalEmail || finalEmail === "user@cybershop.vn") {
                return rejectWithValue(
                    "Không xác định được email tài khoản. Vui lòng đăng nhập lại!",
                );
            }

            const payload = {
                email: finalEmail,
                orderDetail: itemsToOrder.map((item) => ({
                    productId: String(item.id),
                    quantity: Number(item.quantity),
                })),
            };
            const response = await api.post("/api/Users/order", payload);
            if (
                response.data?.statusCode >= 400 ||
                response.data?.success === false
            ) {
                return rejectWithValue(
                    response.data?.message || "Đặt hàng thất bại.",
                );
            }

            dispatch(fetchUserProfile());

            return itemsToOrder.map(
                (item) => item.key || item.cartKey || String(item.id),
            );
        } catch (error) {
            return rejectWithValue(
                getApiErrorMessage(
                    error,
                    "Đặt hàng thất bại. Vui lòng thử lại.",
                ),
            );
        }
    },
);
function resolveUserEmail(passedEmail) {
    if (passedEmail && passedEmail !== "user@cybershop.vn") {
        return passedEmail;
    }
    if (typeof window === "undefined") return passedEmail || "";

    try {
        const rawUser =
            window.localStorage.getItem("userLogin") ||
            window.localStorage.getItem("user") ||
            window.localStorage.getItem("email");
        if (rawUser) {
            const parsed = rawUser.startsWith("{")
                ? JSON.parse(rawUser)
                : { email: rawUser };
            const found = parsed?.email || parsed?.content?.email;
            if (found && found !== "user@cybershop.vn") return found;
        }
        const token = window.localStorage.getItem("accessToken");
        if (token && token.includes(".")) {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(window.atob(base64));
            const tokenEmail =
                payload.email ||
                payload.unique_name ||
                payload[
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
                ] ||
                (typeof payload.sub === "string" && payload.sub.includes("@")
                    ? payload.sub
                    : "");
            if (tokenEmail) return tokenEmail;
        }
    } catch (e) {
        console.error("Không thể tự giải mã email:", e);
    }
    return passedEmail || "";
}

export const fetchUserProfile = createAsyncThunk(
    "products/fetchUserProfile",
    async (_, { rejectWithValue }) => {
        try {
            const token =
                typeof window !== "undefined"
                    ? window.localStorage.getItem("accessToken")
                    : null;

            if (!token) {
                return rejectWithValue(
                    "Bạn cần đăng nhập để xem thông tin tài khoản.",
                );
            }

            const response = await api.post("/api/Users/getProfile");
            if (
                response.data?.statusCode >= 400 ||
                response.data?.success === false
            ) {
                return rejectWithValue(
                    response.data?.message || "Không thể tải thông tin hồ sơ.",
                );
            }

            const profile = unwrapPayload(response.data);
            if (profile?.email && typeof window !== "undefined") {
                window.localStorage.setItem("email", profile.email);
            }
            return profile;
        } catch (error) {
            return rejectWithValue(
                getApiErrorMessage(
                    error,
                    "Không thể tải thông tin hồ sơ. Vui lòng thử lại.",
                ),
            );
        }
    },
);
const initialState = {
    items: [],
    selectedProduct: null,
    favoriteItems: [],
    cartItems: loadCartFromStorage(),
    loading: false,
    detailLoading: false,
    favoritesLoading: false,
    favoritesLoaded: false,
    error: null,
    detailError: null,
    favoritesError: null,
    userProfile: null,
    profileLoading: false,
    profileError: null,
};

const productSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        clearSelectedProduct(state) {
            state.selectedProduct = null;
            state.detailError = null;
        },
        clearProductError(state) {
            state.error = null;
            state.detailError = null;
            state.favoritesError = null;
        },
        clearFavoriteProducts(state) {
            state.favoriteItems = [];
            state.favoritesLoading = false;
            state.favoritesLoaded = false;
            state.favoritesError = null;
        },
        addToCart(state, action) {
            const { product, quantity = 1, size = null } = action.payload;
            const normalized = normalizeProduct(product);
            const itemKey = `${normalized.id}-${size ?? "default"}`;

            const existing = state.cartItems.find(
                (item) => (item.cartKey || String(item.id)) === itemKey,
            );

            if (existing) {
                existing.quantity += Number(quantity);
            } else {
                state.cartItems.push({
                    ...normalized,
                    cartKey: itemKey,
                    selectedSize: size,
                    quantity: Number(quantity),
                });
            }
            saveCartToStorage(state.cartItems);
        },
        updateCartQuantity(state, action) {
            const { cartKey, quantity } = action.payload;
            const item = state.cartItems.find(
                (i) => (i.cartKey || String(i.id)) === cartKey,
            );
            if (item) {
                item.quantity = Math.max(1, Number(quantity));
                saveCartToStorage(state.cartItems);
            }
        },
        removeFromCart(state, action) {
            const cartKey = action.payload;
            state.cartItems = state.cartItems.filter(
                (item) => (item.cartKey || String(item.id)) !== cartKey,
            );
            saveCartToStorage(state.cartItems);
        },
        clearCart(state) {
            state.cartItems = [];
            saveCartToStorage([]);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload)
                    ? action.payload
                    : [];
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload ||
                    action.error.message ||
                    "Không thể tải sản phẩm.";
            })
            .addCase(fetchProductById.pending, (state) => {
                state.detailLoading = true;
                state.selectedProduct = null;
                state.detailError = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError =
                    action.payload ||
                    action.error.message ||
                    "Không thể tải sản phẩm.";
            })
            .addCase(fetchFavoriteProducts.pending, (state) => {
                state.favoritesLoading = true;
                state.favoritesError = null;
            })
            .addCase(fetchFavoriteProducts.fulfilled, (state, action) => {
                state.favoritesLoading = false;
                state.favoritesLoaded = true;
                state.favoriteItems = Array.isArray(action.payload)
                    ? action.payload
                    : [];
            })
            .addCase(fetchFavoriteProducts.rejected, (state, action) => {
                state.favoritesLoading = false;
                state.favoritesLoaded = true;
                state.favoritesError =
                    action.payload ||
                    action.error.message ||
                    "Không thể tải danh sách yêu thích.";
            })
            .addCase(toggleFavoriteProduct.fulfilled, (state, action) => {
                const { product, isLiked } = action.payload;
                const productIdStr = String(product.id);

                if (isLiked) {
                    const exists = state.favoriteItems.some(
                        (item) => String(item.id) === productIdStr,
                    );
                    if (!exists) {
                        state.favoriteItems.push(product);
                    }
                } else {
                    state.favoriteItems = state.favoriteItems.filter(
                        (item) => String(item.id) !== productIdStr,
                    );
                }
            })
            .addCase(toggleFavoriteProduct.rejected, (state, action) => {
                state.favoritesError =
                    action.payload ||
                    action.error.message ||
                    "Không thể cập nhật danh sách yêu thích.";
            })
            .addCase(submitOrder.fulfilled, (state, action) => {
                const orderedKeys = new Set(action.payload || []);
                state.cartItems = state.cartItems.filter(
                    (item) => !orderedKeys.has(item.cartKey || String(item.id)),
                );
                saveCartToStorage(state.cartItems);
            })
            .addCase(fetchUserProfile.pending, (state) => {
                state.profileLoading = true;
                state.profileError = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.userProfile = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.profileError =
                    action.payload ||
                    action.error.message ||
                    "Không thể tải thông tin hồ sơ.";
            });
    },
});

export const {
    clearSelectedProduct,
    clearProductError,
    clearFavoriteProducts,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
} = productSlice.actions;

export default productSlice.reducer;
