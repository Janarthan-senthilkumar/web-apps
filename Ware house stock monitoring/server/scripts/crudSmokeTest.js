/* eslint-disable no-console */
const { randomUUID } = require('crypto');

const TEST_PORT = process.env.CRUDE2E_PORT || '5100';
process.env.PORT = process.env.PORT || TEST_PORT;
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const baseUrl = `http://localhost:${process.env.PORT}/api`;
const { server } = require('../server');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fail = (message) => {
  throw new Error(message);
};

const step = async (name, fn) => {
  await fn();
  console.log(`PASS: ${name}`);
};

const request = async ({ method = 'GET', path, token, body, expectedStatus = 200 }) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (response.status !== expectedStatus) {
    fail(
      `Request failed: ${method} ${path} expected ${expectedStatus}, got ${response.status}. ` +
      `Response: ${JSON.stringify(payload)}`
    );
  }

  return payload;
};

const waitForHealth = async () => {
  for (let i = 0; i < 30; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch (error) {
      // ignore and retry
    }
    await sleep(500);
  }
  fail('Server did not become healthy in time');
};

const assert = (condition, message) => {
  if (!condition) fail(message);
};

const run = async () => {
  const uid = randomUUID().replace(/-/g, '').slice(0, 12);
  const adminEmail = `qa.admin.${uid}@example.com`;

  await waitForHealth();

  const register = await request({
    method: 'POST',
    path: '/auth/register',
    expectedStatus: 201,
    body: {
      name: `QA Admin ${uid}`,
      email: adminEmail,
      password: 'password123',
      role: 'admin',
    },
  });

  const token = register.token;
  const adminUserId = register.user?.id || register.user?._id;
  assert(token, 'Auth token missing after register');
  console.log('PASS: Register admin user');

  let warehouseId;
  let categoryId;
  let supplierId;
  let productId;
  let userId;
  let inventoryId;

  await step('Warehouse CRUD', async () => {
    const warehouseCode = `QW${uid.slice(-5).toUpperCase()}`;
    const created = await request({
      method: 'POST',
      path: '/warehouses',
      token,
      expectedStatus: 201,
      body: {
        name: `QA Warehouse ${uid}`,
        code: warehouseCode,
        capacity: 1000,
        address: { city: 'Bengaluru', state: 'KA', country: 'India' },
      },
    });
    warehouseId = created.data._id;
    assert(warehouseId, 'Warehouse create did not return id');

    const read = await request({ path: `/warehouses/${warehouseId}`, token });
    assert(read.data._id === warehouseId, 'Warehouse read mismatch');

    const updated = await request({
      method: 'PUT',
      path: `/warehouses/${warehouseId}`,
      token,
      body: { description: 'Updated by CRUD smoke test' },
    });
    assert(updated.data.description === 'Updated by CRUD smoke test', 'Warehouse update failed');

    await request({ method: 'DELETE', path: `/warehouses/${warehouseId}`, token });
    const afterDelete = await request({ path: `/warehouses/${warehouseId}`, token });
    assert(afterDelete.data.isActive === false, 'Warehouse was not deactivated');
  });

  await step('Category CRUD', async () => {
    const created = await request({
      method: 'POST',
      path: '/categories',
      token,
      expectedStatus: 201,
      body: {
        name: `QA Category ${uid}`,
        code: `QC${uid.slice(-5).toUpperCase()}`,
      },
    });
    categoryId = created.data._id;
    assert(categoryId, 'Category create did not return id');

    const read = await request({ path: `/categories/${categoryId}`, token });
    assert(read.data._id === categoryId, 'Category read mismatch');

    const updated = await request({
      method: 'PUT',
      path: `/categories/${categoryId}`,
      token,
      body: { description: 'Updated category' },
    });
    assert(updated.data.description === 'Updated category', 'Category update failed');

    await request({ method: 'DELETE', path: `/categories/${categoryId}`, token });
    const afterDelete = await request({ path: `/categories/${categoryId}`, token });
    assert(afterDelete.data.isActive === false, 'Category was not deactivated');
  });

  await step('Supplier CRUD', async () => {
    const created = await request({
      method: 'POST',
      path: '/suppliers',
      token,
      expectedStatus: 201,
      body: {
        name: `QA Supplier ${uid}`,
        code: `QS${uid.slice(-5).toUpperCase()}`,
        email: `qa.supplier.${uid}@example.com`,
      },
    });
    supplierId = created.data._id;
    assert(supplierId, 'Supplier create did not return id');

    const read = await request({ path: `/suppliers/${supplierId}`, token });
    assert(read.data._id === supplierId, 'Supplier read mismatch');

    const updated = await request({
      method: 'PUT',
      path: `/suppliers/${supplierId}`,
      token,
      body: { contactPerson: 'QA Bot' },
    });
    assert(updated.data.contactPerson === 'QA Bot', 'Supplier update failed');

    await request({ method: 'DELETE', path: `/suppliers/${supplierId}`, token });
    const afterDelete = await request({ path: `/suppliers/${supplierId}`, token });
    assert(afterDelete.data.isActive === false, 'Supplier was not deactivated');
  });

  await step('Product CRUD', async () => {
    const productWarehouse = await request({
      method: 'POST',
      path: '/warehouses',
      token,
      expectedStatus: 201,
      body: {
        name: `QA Product Warehouse ${uid}`,
        code: `QPW${uid.slice(-4).toUpperCase()}`,
        capacity: 1000,
      },
    });

    const productCategory = await request({
      method: 'POST',
      path: '/categories',
      token,
      expectedStatus: 201,
      body: {
        name: `QA Product Category ${uid}`,
        code: `QPC${uid.slice(-4).toUpperCase()}`,
      },
    });

    const productSupplier = await request({
      method: 'POST',
      path: '/suppliers',
      token,
      expectedStatus: 201,
      body: {
        name: `QA Product Supplier ${uid}`,
        code: `QPS${uid.slice(-4).toUpperCase()}`,
      },
    });

    const created = await request({
      method: 'POST',
      path: '/products',
      token,
      expectedStatus: 201,
      body: {
        sku: `QAP${uid.slice(-6).toUpperCase()}`,
        name: `QA Product ${uid}`,
        category: productCategory.data._id,
        supplier: productSupplier.data._id,
        costPrice: 100,
        sellingPrice: 150,
        reorderLevel: 5,
        reorderQuantity: 25,
        maxStockThreshold: 500,
        unitOfMeasure: 'pcs',
      },
    });
    productId = created.data._id;
    assert(productId, 'Product create did not return id');

    const read = await request({ path: `/products/${productId}`, token });
    assert(read.data._id === productId, 'Product read mismatch');

    const inventoryRows = await request({
      path: `/inventory?product=${productId}&warehouse=${productWarehouse.data._id}`,
      token,
    });
    assert((inventoryRows.data || []).length > 0, 'New product did not appear in inventory');

    const updated = await request({
      method: 'PUT',
      path: `/products/${productId}`,
      token,
      body: { sellingPrice: 175, description: 'Updated product' },
    });
    assert(Number(updated.data.sellingPrice) === 175, 'Product update failed');

    await request({ method: 'DELETE', path: `/products/${productId}`, token });
    const afterDelete = await request({ path: `/products/${productId}`, token });
    assert(afterDelete.data.status === 'discontinued', 'Product was not discontinued');

    await request({ method: 'DELETE', path: `/categories/${productCategory.data._id}`, token });
    await request({ method: 'DELETE', path: `/suppliers/${productSupplier.data._id}`, token });
    await request({ method: 'DELETE', path: `/warehouses/${productWarehouse.data._id}`, token });
  });

  await step('User CRUD', async () => {
    const created = await request({
      method: 'POST',
      path: '/users',
      token,
      expectedStatus: 201,
      body: {
        name: `QA User ${uid}`,
        email: `qa.user.${uid}@example.com`,
        password: 'password123',
        role: 'staff',
      },
    });
    userId = created.data._id;
    assert(userId, 'User create did not return id');

    const read = await request({ path: `/users/${userId}`, token });
    assert(read.data._id === userId, 'User read mismatch');

    const updated = await request({
      method: 'PUT',
      path: `/users/${userId}`,
      token,
      body: { role: 'manager', phone: '9999999999' },
    });
    assert(updated.data.role === 'manager', 'User update failed');

    await request({ method: 'DELETE', path: `/users/${userId}`, token });
    const afterDelete = await request({ path: `/users/${userId}`, token });
    assert(afterDelete.data.isActive === false, 'User was not deactivated');
  });

  await step('Inventory CRUD', async () => {
    const inventoryWarehouse = await request({
      method: 'POST',
      path: '/warehouses',
      token,
      expectedStatus: 201,
      body: {
        name: `QA Inv Warehouse ${uid}`,
        code: `QIW${uid.slice(-5).toUpperCase()}`,
        capacity: 1000,
      },
    });

    const inventoryCategory = await request({
      method: 'POST',
      path: '/categories',
      token,
      expectedStatus: 201,
      body: {
        name: `QA Inv Category ${uid}`,
        code: `QIC${uid.slice(-4).toUpperCase()}`,
      },
    });

    const inventoryProduct = await request({
      method: 'POST',
      path: '/products',
      token,
      expectedStatus: 201,
      body: {
        sku: `QAI${uid.slice(-6).toUpperCase()}`,
        name: `QA Inv Product ${uid}`,
        category: inventoryCategory.data._id,
        costPrice: 200,
        sellingPrice: 275,
      },
    });

    const existingRows = await request({
      path: `/inventory?product=${inventoryProduct.data._id}&warehouse=${inventoryWarehouse.data._id}`,
      token,
    });

    if ((existingRows.data || []).length > 0) {
      inventoryId = existingRows.data[0]._id;
    } else {
      const created = await request({
        method: 'POST',
        path: '/inventory',
        token,
        expectedStatus: 201,
        body: {
          product: inventoryProduct.data._id,
          warehouse: inventoryWarehouse.data._id,
          quantity: 50,
          reservedQuantity: 5,
          costPrice: 200,
        },
      });
      inventoryId = created.data._id;
    }

    assert(inventoryId, 'Inventory create did not return id');

    const read = await request({ path: `/inventory/${inventoryId}`, token });
    assert(read.data._id === inventoryId, 'Inventory read mismatch');

    const updated = await request({
      method: 'PUT',
      path: `/inventory/${inventoryId}`,
      token,
      body: { status: 'low-stock' },
    });
    assert(updated.data.status === 'low-stock', 'Inventory update failed');

    await request({ method: 'DELETE', path: `/inventory/${inventoryId}`, token });
    await request({ path: `/inventory/${inventoryId}`, token, expectedStatus: 404 });

    await request({ method: 'DELETE', path: `/products/${inventoryProduct.data._id}`, token });
    await request({ method: 'DELETE', path: `/categories/${inventoryCategory.data._id}`, token });
    await request({ method: 'DELETE', path: `/warehouses/${inventoryWarehouse.data._id}`, token });
  });

  await step('Audit trail endpoint', async () => {
    const trail = await request({
      path: `/audit/trail/warehouse/${warehouseId}`,
      token,
      expectedStatus: 200,
    });
    assert(Array.isArray(trail.data), 'Audit trail did not return a list');
  });

  await step('Cleanup admin user', async () => {
    if (!adminUserId) return;
    await request({ method: 'DELETE', path: `/users/${adminUserId}`, token });
  });

  console.log('ALL CRUD SMOKE TESTS PASSED');
};

run()
  .catch((error) => {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => {
    server.close(() => {
      process.exit(process.exitCode || 0);
    });
  });
