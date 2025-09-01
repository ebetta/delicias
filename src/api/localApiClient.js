const API_URL = 'http://localhost:3001/api';

export const getProducts = async () => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

export const getProductById = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch product');
    }
    return response.json();
};

export const createProduct = async (productData) => {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        throw new Error('Failed to create product');
    }
    return response.json();
};

export const updateProduct = async (id, productData) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        throw new Error('Failed to update product');
    }
    return response.json();
};

export const deleteProduct = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete product');
    }
    return response.json();
};

export const reorderProducts = async (orderedIds) => {
    const response = await fetch(`${API_URL}/products/reorder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderedIds }),
    });
    if (!response.ok) {
        throw new Error('Failed to reorder products');
    }
    return response.json();
};

export const getSettings = async () => {
  const response = await fetch(`${API_URL}/settings`);
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
};

const localApiClient = {
    get: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${endpoint}`);
        }
        return response.json();
    },
    post: async (endpoint, data, options) => {
        const isFormData = data instanceof FormData;

        const config = {
            method: 'POST',
            ...options,
            body: data,
        };

        if (!isFormData) {
            config.headers = {
                'Content-Type': 'application/json',
                ...options?.headers,
            };
            config.body = JSON.stringify(data);
        } else if (options?.headers) {
            config.headers = options.headers;
        }

        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (!response.ok) {
            throw new Error(`Failed to post to ${endpoint}`);
        }
        return response.json();
    }
};

export default localApiClient;