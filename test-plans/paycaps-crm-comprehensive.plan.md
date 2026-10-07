# PayCaps CRM Complete Application Test Plan

## Application Overview

Complete functional test plan for the PayCaps CRM sandbox application at https://sandbox.paycaps.com/crm. Coverage is based on exploration after authenticating with the authorized admin account and manually entering the CAPTCHA. Each test assumes a fresh browser context unless stated otherwise, uses sandbox data only, and must be independent and repeatable.

## Test Scenarios

### 1. Authentication and session security

**Seed:** `tests/seed.spec.ts`

#### 1.1. Authenticate with valid credentials and manually entered CAPTCHA

**File:** `tests/auth/login-happy-path.spec.ts`

**Steps:**
  1. Start a fresh browser context and navigate to https://sandbox.paycaps.com/crm/login.
    - expect: The login page shows the PayCaps logo, Welcome Back heading, Email Address, Password, Captcha challenge, Reload captcha, Forgot Password, and Sign In controls.
  2. Enter the authorized email address and password.
    - expect: The email is accepted, the password is masked, and no credential value is exposed in the page text.
  3. Enter the CAPTCHA manually, then click Sign In.
    - expect: The user is redirected to /crm/dashboard.
    - expect: The dashboard header, navigation, authenticated user menu, and payment summary are visible.

#### 1.2. Validate empty, malformed, incorrect, and stale login submissions

**File:** `tests/auth/login-validation.spec.ts`

**Steps:**
  1. Click Sign In with all fields empty.
    - expect: Required validation is shown for each mandatory field and the login request is not submitted.
  2. Enter a malformed email, a short/invalid password, and invalid CAPTCHA, then submit.
    - expect: Field validation or an authentication error is displayed and the protected CRM is not opened.
  3. Refresh the CAPTCHA, enter the previous challenge value with otherwise valid credentials, and submit.
    - expect: The stale value is rejected or the user is required to enter the current CAPTCHA.
  4. Enter the current CAPTCHA and valid credentials and submit again.
    - expect: Authentication succeeds without requiring a browser refresh.
  5. Click Reload captcha repeatedly.
    - expect: A new challenge is displayed each time and the control does not corrupt the form or create duplicate requests.

#### 1.3. Validate forgot-password access and recovery behavior

**File:** `tests/auth/forgot-password.spec.ts`

**Steps:**
  1. Select Forgot Password? from the login page.
    - expect: The application opens the password-recovery page with an email field and submission control.
  2. Submit blank and malformed email values.
    - expect: Required and format errors are shown and no recovery request is accepted.
  3. Submit a valid email address permitted for sandbox testing.
    - expect: A generic confirmation is shown without exposing account-enumeration information.

#### 1.4. Verify profile, theme, sidebar, logout, and protected-route behavior

**File:** `tests/auth/session-lifecycle.spec.ts`

**Steps:**
  1. Log in and click Toggle sidebar.
    - expect: The sidebar collapses and expands while the current route and page data remain unchanged.
  2. Click Toggle theme and navigate to another module.
    - expect: The theme changes, controls remain readable, and the preference remains consistent after navigation.
  3. Open User menu.
    - expect: The menu displays the signed-in account, ADMIN role, Profile, and Logout actions.
  4. Open Profile, then return to the dashboard.
    - expect: The profile route loads and returning to the dashboard preserves authentication.
  5. Select Logout and open /crm/dashboard directly in the same browser.
    - expect: The session ends, the user is redirected to login or denied access, and no dashboard data is exposed.

### 2. Global navigation and dashboard

**Seed:** `tests/seed.spec.ts`

#### 2.1. Open all primary navigation sections and preserve route context

**File:** `tests/navigation/all-primary-navigation.spec.ts`

**Steps:**
  1. Log in and open Dashboard, POI, Transactions, Payment Reports, Account & Finance, Pay By Link, Invoice, Analytics, View Chargeback, Payment Billing, Merchants, Reseller Setup, and Sub-Admins one at a time.
    - expect: Each control either opens its route or expands its submenu; no control is dead, duplicated, or unexpectedly logs the user out.
  2. Open nested options under Payment Reports: Authorized, Sale, Merchant Visibility, Failed, Refund, Risk, Summary, and Settlements.
    - expect: Each option has the intended route, page heading, breadcrumb, controls, and loading/data/empty state.
  3. Open Account & Finance options MIS Reports and Download reports.
    - expect: The finance pages load and retain the Account & Finance context.
  4. Open Analytics options Performance Report, Weekly Performance Report, and Hourly Performance Report.
    - expect: Each analytics report loads with its own title and expected filters/visualizations.
  5. Open Payment Billing options Acquirer Routing, VAT / Service Tax, MDR Setting, and MDR Surcharge Setting.
    - expect: Each configuration page loads with controls appropriate to the admin role.
  6. Open Merchants options User Registration, Merchant List, and Merchant Sub-Users; Reseller Setup options Reseller Accounts and Reseller Mapping; and Sub-Admins options Manage Sub-Admins and User Login History.
    - expect: All observed submenu destinations are reachable and show correct breadcrumb/navigation state.

#### 2.2. Verify dashboard metrics, chart, date range, filters, and actions

**File:** `tests/dashboard/overview-and-filters.spec.ts`

**Steps:**
  1. Open Dashboard from a fresh authenticated session.
    - expect: The page shows Admin payment overview, Today date range, Filters, More actions, Payment summary, and Monthly Transaction chart.
  2. Record the displayed Success, Failed, Invalid, Refund, and Success rate card values.
    - expect: Each card has a label and consistent count/amount; success-rate numerator and denominator reconcile with the displayed totals.
  3. Change the Date range and apply a different supported period.
    - expect: The selected period is visible and all summary cards/chart values refresh together.
  4. Apply dashboard filters individually and in combination.
    - expect: The results reflect all selected criteria and clearing filters restores the prior dataset.
  5. Use More actions if available and verify cancel behavior for any dialog.
    - expect: Actions are clearly labeled, cancellable, and do not modify data without confirmation.
  6. Use a date/filter combination with no records.
    - expect: Zero values or an explicit empty state is shown without stale metrics, broken chart axes, or errors.

### 3. Transactions and payment reports

**Seed:** `tests/seed.spec.ts`

#### 3.1. Search, filter, inspect, and paginate transaction records

**File:** `tests/transactions/transaction-list-filtering.spec.ts`

**Steps:**
  1. Open Transactions.
    - expect: The page shows Search and review payment transactions, date range, Filters, transaction table, and Rows per page controls.
  2. Search by an exact visible TXN ID and ORDER ID.
    - expect: Only the matching record is displayed and clearing search restores the list.
  3. Apply supported date, merchant, status, payment method, transaction type, currency, and amount filters.
    - expect: Every returned row satisfies all active filters.
  4. Use invalid identifiers, malformed amounts, reversed dates, and an empty result range.
    - expect: The page shows validation or a clear no-results state and never silently returns unrelated rows.
  5. Change rows per page and move through first, next, previous, and last pages.
    - expect: Page size, page number, disabled boundary controls, and record continuity are correct.
  6. Open a transaction detail/action if available.
    - expect: The detail matches the selected TXN ID, order ID, status, type, currency, amount, and date.

#### 3.2. Verify payment report types and consistent report behavior

**File:** `tests/reports/report-navigation-and-data.spec.ts`

**Steps:**
  1. Open each Payment Reports submenu page.
    - expect: Each page displays the correct report heading, date/filter controls, columns, loading behavior, and data/empty state.
  2. On Sale Report, verify captured-payment columns including TXN ID, transaction date, order ID, business, customer email/name, payment method, masked card detail, currency, amount, and refund action.
    - expect: Columns are correctly labeled, card data is masked, and values match the underlying transactions.
  3. On Sale, MIS, and other report pages, apply date and merchant filters.
    - expect: Filtered tables show only matching rows and totals remain consistent.
  4. Navigate report pagination and refresh the page.
    - expect: The selected page and filters behave predictably and records are not duplicated.

#### 3.3. Export reports and safely process eligible refunds

**File:** `tests/reports/export-and-refund.spec.ts`

**Steps:**
  1. Apply a known filter to Sale Report and click Export.
    - expect: A file is generated containing the filtered report and expected columns, or an explicit error is shown if export fails.
  2. Select Refund for one eligible sandbox payment.
    - expect: A confirmation identifies the exact transaction and amount; canceling makes no change.
  3. Confirm the refund once, then refresh the report.
    - expect: One success message appears and the transaction reflects the refund exactly once.
  4. Click Refund All with no eligible rows or cancel the confirmation.
    - expect: No unintended refund is processed and the UI reports the reason or cancellation.
  5. Attempt to repeat a completed refund.
    - expect: The application prevents duplicate processing or reports that the payment is already refunded.

#### 3.4. Verify MIS reports and chargeback case management

**File:** `tests/reports/mis-and-chargeback.spec.ts`

**Steps:**
  1. Open MIS Reports.
    - expect: The page explains nodal settlement MIS, shows date/filter controls, Export, settlement columns, and records when available.
  2. Filter by merchant, acquirer, and date, then export.
    - expect: The table and file contain the same filtered merchant, transaction, date, gross amount, commission, payable, and payout data.
  3. Open View Chargeback.
    - expect: Chargeback Cases shows total case count, date range, Filters, pagination, and case ID, order ID, merchant, type, status, amount, target date, and create date columns.
  4. Filter cases by ID, merchant, status, and date; open a case if an action exists.
    - expect: Only matching cases appear and the detail preserves the list values.
  5. Use invalid filters and pagination boundaries.
    - expect: A clear no-results state or validation appears and no case is duplicated or omitted.

### 4. Pay By Link and invoice workflows

**Seed:** `tests/seed.spec.ts`

#### 4.1. Create and validate single- and multi-payment links

**File:** `tests/pay-by-link/create-and-validate.spec.ts`

**Steps:**
  1. Open Pay By Link and click Create.
    - expect: Create Pay By Link shows Single payment and Multi-payment choices, merchant, currency, amount, customer email/name/code/phone, edit-permission option, expiry, purpose counter, summary, and Continue.
  2. Click Continue with required fields empty.
    - expect: Required validation is displayed and no link is created.
  3. Enter malformed email/phone, zero/negative/non-numeric amount, expired date/time, and purpose exceeding 100 characters.
    - expect: Each invalid value is rejected with field-level feedback and is not copied into the summary.
  4. Enter valid required and optional values for Single payment.
    - expect: The summary correctly reflects amount, currency, type, merchant, customer, contact, expiry, and purpose.
  5. Continue and confirm once.
    - expect: One active link is created and appears in the list with matching type, amount, customer, and status.
  6. Repeat with Multi-payment selected.
    - expect: Multi-payment rules are applied and values from the previous Single-payment form do not leak into the new configuration.
  7. Filter, paginate, and open an existing link action.
    - expect: Filters and paging are correct and the selected link action affects only that record with explicit feedback.

#### 4.2. Create an invoice and verify fields, preview, VAT, and totals

**File:** `tests/invoices/create-and-calculate.spec.ts`

**Steps:**
  1. Open Invoice and click Create.
    - expect: The form shows merchant, currency, recurring frequency, invoice number, phone, email, billing address, product/service, expiry, quantity, amount, VAT, total, SMS fields, preview, and Continue.
  2. Submit blank, malformed, negative, zero, overlong, and out-of-range values in each required or numeric field.
    - expect: Required, format, length, and numeric validation is shown; no invoice is submitted.
  3. Enter valid merchant, currency, invoice/customer/billing/product values, quantity, amount, expiry, and VAT.
    - expect: The preview updates and subtotal, VAT, and total are mathematically correct with expected rounding.
  4. Continue to review and cancel.
    - expect: Cancel returns safely without creating an invoice or losing unrelated application state.
  5. Repeat and confirm creation once.
    - expect: Exactly one invoice is created, success feedback appears, and the list record matches customer, currency, product, amount, due date, recurring frequency, and expiry.
  6. Filter, paginate, and use available invoice actions.
    - expect: The selected invoice alone is opened/managed and list state remains consistent.

#### 4.3. Preserve form state and prevent duplicate creation

**File:** `tests/forms/unsaved-changes-and-retry.spec.ts`

**Steps:**
  1. Populate Pay By Link or Invoice fields, navigate Back, and return to the creation screen.
    - expect: The application follows its documented draft behavior; it neither silently submits nor creates a duplicate.
  2. Click Continue repeatedly while the request is processing and refresh after success.
    - expect: The submit action is disabled/debounced and only one record is created.
  3. Simulate a create-service error after entering valid data.
    - expect: An explicit error is shown, entered values are preserved where possible, and no success-shaped record appears.

### 5. Account, reseller, and administration modules

**Seed:** `tests/seed.spec.ts`

#### 5.1. Search merchant management and open merchant setup

**File:** `tests/merchants/merchant-list-and-setup.spec.ts`

**Steps:**
  1. Open Merchants > Merchant List.
    - expect: Merchant Management displays search/filter, Refresh, merchant ID, business name, email, mobile, registration date, status, actions, and pagination.
  2. Search by exact merchant ID, business name, email, and status.
    - expect: Matching records are returned and clearing filters restores the list.
  3. Open Setup for an active and a pending merchant.
    - expect: The selected merchant context is correct and the setup controls reflect the merchant status and admin permissions.
  4. Submit incomplete and invalid merchant setup data.
    - expect: Validation prevents an invalid save and reports errors explicitly.
  5. Save valid sandbox setup data, refresh, and reopen the merchant.
    - expect: The change persists only after success and is associated with the correct merchant.

#### 5.2. Validate merchant registration and merchant sub-user flows

**File:** `tests/accounts/user-registration-and-subusers.spec.ts`

**Steps:**
  1. Open User Registration and Merchant Sub-Users.
    - expect: Each page loads with its intended list, filters, create/edit controls, fields, status, and actions.
  2. Submit blank, invalid email/phone, duplicate, and unauthorized-role values.
    - expect: Validation or duplicate handling prevents malformed records and does not reveal unrelated account data.
  3. Create/edit/deactivate a permitted sandbox record if test policy allows.
    - expect: The record is created once, updates persist, destructive status changes require confirmation, and the final status is visible after refresh.

#### 5.3. Verify reseller accounts and reseller mapping

**File:** `tests/accounts/reseller-management.spec.ts`

**Steps:**
  1. Open Reseller Setup > Reseller Accounts and Reseller Mapping.
    - expect: Both pages load with the correct breadcrumb, list/table fields, filters, relationship controls, and empty states.
  2. Try invalid, incomplete, duplicate, and valid reseller operations using sandbox-safe data.
    - expect: Invalid operations are rejected with explicit feedback; valid changes affect only the selected reseller and mapping.
  3. Refresh and navigate between account pages.
    - expect: Persisted mappings remain consistent and no stale selection is applied to another reseller.

#### 5.4. Manage sub-admins and review user login history

**File:** `tests/accounts/subadmins-and-login-history.spec.ts`

**Steps:**
  1. Open Sub-Admins > Manage Sub-Admins.
    - expect: The page displays admin/sub-admin records, role/status fields, filters, and permitted actions.
  2. Submit empty, malformed, duplicate, and invalid role/status values.
    - expect: Validation prevents invalid user creation or updates.
  3. Create, edit, and deactivate a permitted sandbox sub-admin if authorized.
    - expect: Each operation requires appropriate confirmation, is performed once, and is reflected after refresh.
  4. Open User Login History and filter by user, status, and date.
    - expect: Login events show accurate user, timestamp, outcome, and filters; empty results are clear.

### 6. Analytics, payment configuration, and access control

**Seed:** `tests/seed.spec.ts`

#### 6.1. Verify analytics report views and date/filter behavior

**File:** `tests/analytics/analytics-reports.spec.ts`

**Steps:**
  1. Open Analytics > Performance Report, Weekly Performance Report, and Hourly Performance Report.
    - expect: Each report has the correct heading, period controls, filters, charts/tables, legends, and loading state.
  2. Change date ranges and apply supported filters.
    - expect: Visualizations and totals update consistently and no previous-period data remains visible.
  3. Use a no-data period and resize the viewport.
    - expect: The report displays an accessible empty state and remains readable without overlapping charts or controls.

#### 6.2. Verify payment billing configuration pages

**File:** `tests/configuration/payment-billing-controls.spec.ts`

**Steps:**
  1. Open Acquirer Routing, VAT / Service Tax, MDR Setting, and MDR Surcharge Setting.
    - expect: Each configuration page loads with its intended current values, controls, validation, and save/cancel actions.
  2. Attempt blank, invalid range, negative, excessive precision, and conflicting configuration values.
    - expect: Field validation prevents invalid settings and shows explicit messages.
  3. Change a valid sandbox setting, save, cancel another change, and refresh.
    - expect: Saved values persist, canceled values do not, and save failures are surfaced without false success.
  4. Access these routes as a role without permission if available.
    - expect: Unauthorized users cannot view or modify protected configuration.

#### 6.3. Enforce route and action authorization

**File:** `tests/access/role-and-route-protection.spec.ts`

**Steps:**
  1. Copy protected URLs for dashboard, transactions, reports, merchant setup, finance, reseller, and sub-admin pages into a fresh logged-out context.
    - expect: Each route redirects to login or returns an appropriate authorization response without protected data.
  2. Log in as a restricted role if available and open administrative routes and destructive actions.
    - expect: Unauthorized routes/actions are hidden or denied consistently and no sensitive data is disclosed.
  3. Attempt direct API/UI replay of refund, create, deactivate, and configuration save actions.
    - expect: Server-side authorization and idempotency prevent unauthorized or duplicate mutations.

### 7. Quality, error handling, accessibility, and security

**Seed:** `tests/seed.spec.ts`

#### 7.1. Verify loading, empty, timeout, and service-error handling

**File:** `tests/quality/loading-empty-error-states.spec.ts`

**Steps:**
  1. Open each list/report page on a slow connection or while its request is pending.
    - expect: A loading state is shown and the page does not present incomplete data as final.
  2. Use filters that return no records.
    - expect: A clear empty state appears with stable headers and pagination controls.
  3. Cause list, detail, export, create, and save requests to return 4xx, 5xx, or timeout responses in a controlled test environment.
    - expect: The user receives an explicit error, entered data is preserved when appropriate, no false success is shown, and retry behavior is safe.
  4. Refresh or navigate away during a pending request.
    - expect: No duplicate mutation occurs and the final page state is coherent.

#### 7.2. Verify keyboard access, semantics, themes, and responsive layout

**File:** `tests/quality/accessibility-responsive.spec.ts`

**Steps:**
  1. Use keyboard-only navigation through login, navigation, filter forms, dropdowns, tables, creation forms, confirmation dialogs, and user menu.
    - expect: Focus order is logical, focus is visible, labels are associated, dialogs trap focus, and focus returns to the triggering control.
  2. Inspect desktop, tablet, and mobile viewport sizes.
    - expect: Primary actions remain available, tables are usable, controls do not overlap, and intentional horizontal scrolling is accessible.
  3. Toggle light/dark theme and inspect text, status badges, form errors, focus indicators, charts, and dialogs.
    - expect: Both themes remain readable and usable with adequate contrast.
  4. Inspect images, CAPTCHA, icons, and buttons with accessibility tooling.
    - expect: Meaningful images have accessible names, decorative content is hidden appropriately, and controls have unique names.

#### 7.3. Protect sensitive data and safely handle hostile input

**File:** `tests/quality/input-security-and-data-protection.spec.ts`

**Steps:**
  1. Inspect transaction, report, refund, payment-link, invoice, and merchant data in the UI and exports.
    - expect: Card numbers remain masked, passwords/CAPTCHAs are not exposed, and only authorized data is shown.
  2. Enter script-like strings, SQL metacharacters, HTML, Unicode, whitespace, very long values, and boundary numeric values in search and form fields.
    - expect: Values are escaped or validated, no script executes, layout remains stable, and server errors are handled safely.
  3. Use browser back/forward, duplicate tabs, refresh, and copied action URLs around refund, creation, deactivation, and save operations.
    - expect: Authentication and authorization remain enforced and actions are not replayed accidentally.
  4. Inspect network-visible errors and page content after failed authentication and protected-route access.
    - expect: Credentials, tokens, internal stack traces, and sensitive account data are not exposed.
