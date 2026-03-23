# Inventory Validation Improvements - Stock Overflow Prevention

## Problem Identified
Variants with insufficient stock could be added to cart and sent to backend, causing "Insufficient stock" errors. This occurred in multiple ways:

1. **Missing increment validation**: Adding existing items to cart bypassed stock checks
2. **Stale filter data**: Using `filteredVariants` instead of `allVariants` for validation
3. **Missing pre-checkout validation**: No final check before processing sales
4. **Offline mode conflicts**: Offline transactions could exceed stock when synced online

---

## Solutions Implemented

### 1. ✅ **Stock Validation in handleAddToCart** (`page.tsx`)
**File**: [app/pos/page.tsx](app/pos/page.tsx#L223-L270)

**What was fixed**:
- Added stock check when incrementing existing cart items
- Shows specific error message with available vs requested quantity
- Prevents adding out-of-stock items initially

```typescript
if (existingItem) {
  // Check if incrementing quantity would exceed available stock
  if (existingItem.quantity + 1 > variant.quantity) {
    toast.error(`⚠️ Only ${variant.quantity} items available. Already have ${existingItem.quantity} in cart.`);
    return;
  }
  // ... proceed with increment
}
```

**Error Messages**:
- ❌ When incrementing existing items: `"Only X items available. Already have Y in cart."`
- ❌ When adding new items with zero stock: `"Product is out of stock"`

---

### 2. ✅ **Use allVariants (Source of Truth)** (`page.tsx`)
**File**: [app/pos/page.tsx](app/pos/page.tsx#L305-L326)

**What was fixed**:
- Changed `handleUpdateQuantity` from using `filteredVariants` → `allVariants`
- `allVariants` is the complete inventory state, unaffected by UI filters
- Prevents validation bypass when products are filtered out

```typescript
const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
  if (newQuantity < 1) {
    setCart(cart.filter(item => item.id !== itemId));
  } else {
    const cartItem = cart.find(item => item.id === itemId);
    // ALWAYS use allVariants (source of truth) instead of filteredVariants
    const variant = allVariants.find(v => v.variant_id === cartItem?.variantId);
    
    if (!variant) {
      toast.error('❌ Product not found in inventory');
      return;
    }
    
    if (newQuantity > variant.quantity) {
      toast.error(`⚠️ Only ${variant.quantity} items available in stock...`);
      return;
    }
    // ... proceed with update
  }
};
```

---

### 3. ✅ **Max Quantity Limits in Cart** (`CartSidebarProps.tsx`)
**File**: [app/pos/components/CartSidebarProps.tsx](app/pos/components/CartSidebarProps.tsx#L343-L369)

**What was fixed**:
- Added `max` attribute to quantity input field
- Disables plus button when quantity reaches available stock
- Tooltip shows available stock

```typescript
<Input
  type="number"
  min="1"
  max={item.stock}  // ← Limits input
  value={item.quantity}
  onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
  title={`Available stock: ${item.stock}`}
/>

<Button
  // ... 
  disabled={item.quantity >= item.stock}  // ← Disables plus button
  title={item.quantity >= item.stock ? 'Maximum stock reached' : 'Increase quantity'}
>
  <Plus className="h-3 w-3" />
</Button>
```

---

### 4. ✅ **Periodic Stock Refresh** (`page.tsx`)
**File**: [app/pos/page.tsx](app/pos/page.tsx#L163-L180)

**What was fixed**:
- Automatically refetches variant stock every 30 seconds
- Detects inventory changes made by other POS terminals
- Only refreshes when online

```typescript
useEffect(() => {
  const stockRefreshInterval = setInterval(async () => {
    if (navigator.onLine) {
      console.log('🔄 Refreshing stock data from server...');
      try {
        await refetchVariants();
      } catch (error) {
        console.warn('⚠️ Failed to refresh stock data:', error);
      }
    }
  }, 30000); // 30 seconds

  return () => clearInterval(stockRefreshInterval);
}, [refetchVariants]);
```

**Benefits**:
- ✅ Multi-terminal sync: See stock changes from other POS terminals
- ✅ Non-blocking: Continues operation if refresh fails
- ✅ Online-only: Respects connectivity status

---

### 5. ✅ **Pre-Checkout Stock Validation** (`CheckoutModalProps.tsx`)
**File**: [app/pos/components/CheckoutModalProps.tsx](app/pos/components/CheckoutModalProps.tsx#L190-L221)

**What was fixed**:
- Validates ALL cart items against latest stock before processing
- Shows specific product and quantity mismatch
- Prevents checkout if any item exceeds current stock

```typescript
const validateStockAvailability = (): { isValid: boolean; errorMessage?: string } => {
  for (const cartItem of cart) {
    const currentVariant = allVariants.find(v => v.variant_id === cartItem.variantId);
    
    if (!currentVariant) {
      return {
        isValid: false,
        errorMessage: `❌ ${cartItem.productName} is no longer available in inventory`,
      };
    }
    
    if (cartItem.quantity > currentVariant.quantity) {
      return {
        isValid: false,
        errorMessage: `⚠️ ${cartItem.productName}: Only ${currentVariant.quantity} items available...`,
      };
    }
  }
  return { isValid: true };
};

const handleCompleteSale = async () => {
  // 🔍 Validate stock availability before processing
  const stockValidation = validateStockAvailability();
  if (!stockValidation.isValid) {
    toast.error(stockValidation.errorMessage);
    return;
  }
  // ... proceed with sale
};
```

---

### 6. ✅ **Enhanced Offline Sync Validation** (`useOfflineSync.ts`)
**File**: [app/pos/components/useOfflineSync.ts](app/pos/components/useOfflineSync.ts#L120-L165)

**What was improved**:
- Better error messages for inventory conflicts during sync
- Explains why inventory errors occur
- Marks inventory errors for retry (not permanent failure)

```typescript
if (isInventoryError) {
  console.warn(
    `📦 Inventory conflict for transaction ${transaction.id}.\n` +
    `Error: ${errorMessage}\n` +
    `This might happen if:\n` +
    `- Stock was sold by another terminal since you created this sale\n` +
    `- Stock levels changed during offline mode\n` +
    `Retrying when stock becomes available...`
  );
  OfflineTransactionManager.markSyncAttempt(
    transaction.id, 
    `Inventory: ${errorMessage}`
  );
}
```

---

## Validation Flow Diagram

```
User Adds Item to Cart
    ↓
✅ Check: item.quantity + 1 > variant.quantity?
    ├─ YES → Show error, prevent add
    └─ NO → Add to cart
    ↓
User Updates Quantity in CartSidebar
    ↓
✅ Check: newQuantity > allVariants[product].quantity?
    ├─ YES → Show error, prevent update
    └─ NO → Update cart
    ↓
User Clicks "Make Sale" / Checkout
    ↓
✅ Every 30 seconds: Refresh stock from server
    ↓
User Confirms Checkout
    ↓
✅ Final validation: All items still in stock?
    ├─ YES → Process sale
    │   ├─ Online → Send to backend immediately
    │   └─ Offline → Save to localStorage
    └─ NO → Show error, prevent checkout
    ↓
[Later] Sync Offline Transactions
    ↓
✅ Backend validates stock again
    ├─ Stock OK → Sale synced ✅
    └─ Stock Low → Error, retry later ⏳
```

---

## Key Changes Summary

| Component | Change | Impact |
|-----------|--------|--------|
| `handleAddToCart()` | Added stock validation for incrementing | Prevents adding beyond stock when item exists |
| `handleUpdateQuantity()` | Use `allVariants` not `filteredVariants` | Validates against complete inventory, not filtered view |
| `CartSidebar Input` | Added `max={item.stock}` attribute | UI prevents exceeding stock |
| `CartSidebar Plus Button` | Added `disabled={qty >= stock}` | Visual feedback when max reached |
| `page.tsx` | Added 30-second stock refresh interval | Detects changes from other POS terminals |
| `CheckoutModal` | Added pre-checkout stock validation | Final safeguard before processing |
| `useOfflineSync` | Enhanced inventory error messages | Better visibility into sync failures |

---

## Testing Recommendations

1. **Test increment validation**: Add item, click add again when only 1 in stock
   - Expected: Error message, quantity not increased

2. **Test allVariants sync**: Open filters, modify quantity of filtered-out item
   - Expected: Validation works, uses actual stock not filtered view

3. **Test max limits**: Use quantity input field
   - Expected: Cannot type value > stock, plus button disabled

4. **Test stock refresh**: Sell item on another terminal, watch first terminal's stock update
   - Expected: Stock updates every 30 seconds automatically

5. **Test pre-checkout validation**: Add items, wait 30 sec for stock refresh, reduce stock on another terminal, try checkout
   - Expected: Checkout blocked with specific error message

6. **Test offline conflicts**: Create sale offline with 5 items, sync when only 2 in stock
   - Expected: Error on sync, marked for retry, not marked as failed

---

## Affected Files

✅ [app/pos/page.tsx](app/pos/page.tsx)
✅ [app/pos/components/CartSidebarProps.tsx](app/pos/components/CartSidebarProps.tsx)
✅ [app/pos/components/CheckoutModalProps.tsx](app/pos/components/CheckoutModalProps.tsx)
✅ [app/pos/components/useOfflineSync.ts](app/pos/components/useOfflineSync.ts)

---

## Migration Notes

- **No breaking changes**: All changes are defensive, only block invalid scenarios
- **User experience**: Toast messages provide clear feedback on why actions are blocked
- **Performance**: 30-second refresh interval is reasonable, adjustable if needed
- **Offline mode**: Continues working, with better error handling during sync
