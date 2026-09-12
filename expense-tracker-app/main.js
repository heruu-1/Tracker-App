/**
 * Expense Tracker App
 * Semua perubahan data melewati localStorage lalu memicu custom event
 * transaction:updated. Satu listener event tersebut memperbarui daftar dan dasbor.
 */

const STORAGE_KEY = 'expense-tracker-transactions';
const UPDATE_EVENT = 'transaction:updated';

let transactions = [];
let searchKeyword = '';
let editingTransactionId = null;
let storageReady = true;

const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');
const transactionForm = document.getElementById('transactionForm');
const titleInput = document.getElementById('transactionFormTitleInput');
const amountInput = document.getElementById('transactionFormAmountInput');
const dateInput = document.getElementById('transactionFormDateInput');
const typeSelect = document.getElementById('transactionFormTypeSelect');
const formHeading = document.getElementById('form-heading');
const formSubmitButton = document.querySelector('[data-testid="transactionFormSubmitButton"]');
const searchForm = document.getElementById('searchTransactionForm');
const searchInput = document.getElementById('searchTransactionFormTitleInput');
const balanceAmount = document.querySelector('.tracker-summary__balance-amount');
const incomeAmount = document.querySelector('.tracker-summary__stat-amount--income');
const expenseAmount = document.querySelector('.tracker-summary__stat-amount--expense');

const cancelEditButton = document.createElement('button');
cancelEditButton.type = 'button';
cancelEditButton.className = 'tracker-form__cancel';
cancelEditButton.textContent = 'Batal Edit';
cancelEditButton.hidden = true;
cancelEditButton.addEventListener('click', resetForm);
transactionForm.append(cancelEditButton);

function createLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatCurrency(value) {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

function isValidDateString(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  return calendarDate.getUTCFullYear() === year
    && calendarDate.getUTCMonth() === month - 1
    && calendarDate.getUTCDate() === day;
}

function isValidTransaction(transaction) {
  return transaction
    && (typeof transaction.id === 'string' || typeof transaction.id === 'number')
    && typeof transaction.title === 'string'
    && transaction.title.trim().length > 0
    && typeof transaction.amount === 'number'
    && Number.isFinite(transaction.amount)
    && transaction.amount >= 1
    && typeof transaction.date === 'string'
    && isValidDateString(transaction.date)
    && (transaction.type === 'income' || transaction.type === 'expense');
}

function showStorageMessage(message) {
  let status = document.getElementById('trackerStorageStatus');
  if (!status) {
    status = document.createElement('p');
    status.id = 'trackerStorageStatus';
    status.className = 'tracker-storage-status';
    status.setAttribute('role', 'alert');
    document.querySelector('.tracker-form-section__card').prepend(status);
  }
  status.textContent = message;
}

function loadTransactions() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    const ids = Array.isArray(parsed) ? parsed.map((transaction) => String(transaction.id)) : [];
    if (!Array.isArray(parsed) || !parsed.every(isValidTransaction) || new Set(ids).size !== ids.length) {
      throw new Error('Format data transaksi tidak valid.');
    }
    return parsed.map((transaction) => ({ ...transaction }));
  } catch (error) {
    storageReady = false;
    showStorageMessage(`Data transaksi tidak dapat dimuat: ${error.message}`);
    return [];
  }
}

function persistTransactions(nextTransactions) {
  if (!storageReady) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTransactions));
    return true;
  } catch (error) {
    showStorageMessage(`Perubahan tidak tersimpan: ${error.message}`);
    return false;
  }
}

function commitTransactions(nextTransactions) {
  if (!persistTransactions(nextTransactions)) return false;
  transactions = nextTransactions;
  document.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  return true;
}

function createUniqueId() {
  let id = Date.now();
  while (transactions.some((transaction) => String(transaction.id) === String(id))) id += 1;
  return id;
}

function getVisibleTransactions() {
  const keyword = searchKeyword.trim().toLocaleLowerCase('id-ID');
  if (!keyword) return transactions;
  return transactions.filter((transaction) => transaction.title.toLocaleLowerCase('id-ID').includes(keyword));
}

function makeTextElement(tagName, testId, text, className = '') {
  const element = document.createElement(tagName);
  element.dataset.testid = testId;
  element.className = className;
  element.textContent = text;
  return element;
}

function createTransactionCard(transaction) {
  const card = document.createElement('article');
  card.dataset.testid = 'transactionItem';
  card.className = `tracker-transaction-item tracker-transaction-item--${transaction.type}`;

  const icon = document.createElement('div');
  icon.className = `tracker-transaction-item__icon tracker-transaction-item__icon--${transaction.type}`;
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = transaction.type === 'income' ? '↗' : '↘';

  const detail = document.createElement('div');
  detail.className = 'tracker-transaction-item__detail';
  detail.append(
    makeTextElement('h3', 'transactionItemTitle', transaction.title, 'tracker-transaction-item__title'),
    makeTextElement('p', 'transactionItemDate', `Tanggal: ${transaction.date}`, 'tracker-transaction-item__date'),
    makeTextElement('p', 'transactionItemType', `Tipe: ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`, 'tracker-transaction-item__type'),
  );

  const right = document.createElement('div');
  right.className = 'tracker-transaction-item__right';
  right.append(makeTextElement(
    'p',
    'transactionItemAmount',
    `${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}`,
    `tracker-transaction-item__amount tracker-transaction-item__amount--${transaction.type}`,
  ));

  const actions = document.createElement('div');
  actions.className = 'tracker-transaction-item__actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.dataset.testid = 'transactionItemEditButton';
  editButton.className = 'tracker-transaction-item__btn';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => beginEdit(transaction.id));

  const editTypeButton = document.createElement('button');
  editTypeButton.type = 'button';
  editTypeButton.dataset.testid = 'transactionItemEditTypeButton';
  editTypeButton.className = 'tracker-transaction-item__btn';
  editTypeButton.textContent = 'Ubah Tipe';
  editTypeButton.addEventListener('click', () => toggleTransactionType(transaction.id));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.dataset.testid = 'transactionItemDeleteButton';
  deleteButton.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--danger';
  deleteButton.textContent = 'Hapus';
  deleteButton.addEventListener('click', () => deleteTransaction(transaction.id));

  actions.append(editButton, editTypeButton, deleteButton);
  right.append(actions);
  card.append(icon, detail, right);
  return card;
}

function renderList(container, type, visibleTransactions) {
  container.replaceChildren();
  const filteredByType = visibleTransactions.filter((transaction) => transaction.type === type);
  if (filteredByType.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'tracker-empty-state';
    empty.setAttribute('role', 'status');
    empty.textContent = searchKeyword.trim() ? 'Tidak ada transaksi yang cocok.' : 'Belum ada transaksi.';
    container.append(empty);
    return;
  }
  filteredByType.forEach((transaction) => container.append(createTransactionCard(transaction)));
}

function render() {
  const visibleTransactions = getVisibleTransactions();
  renderList(incomeList, 'income', visibleTransactions);
  renderList(expenseList, 'expense', visibleTransactions);
}

function updateDashboard() {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);
  balanceAmount.textContent = formatCurrency(totalIncome - totalExpense);
  incomeAmount.textContent = formatCurrency(totalIncome);
  expenseAmount.textContent = formatCurrency(totalExpense);
}

function resetForm() {
  editingTransactionId = null;
  transactionForm.reset();
  dateInput.value = createLocalDateValue();
  formHeading.textContent = 'Tambah Pencatatan Baru';
  formSubmitButton.textContent = 'Simpan';
  cancelEditButton.hidden = true;
}

function beginEdit(id) {
  const transaction = transactions.find((item) => String(item.id) === String(id));
  if (!transaction) return;
  editingTransactionId = transaction.id;
  titleInput.value = transaction.title;
  amountInput.value = transaction.amount;
  dateInput.value = transaction.date;
  typeSelect.value = transaction.type;
  formHeading.textContent = 'Edit Pencatatan';
  formSubmitButton.textContent = 'Simpan Perubahan';
  cancelEditButton.hidden = false;
  titleInput.focus();
}

function readFormTransaction() {
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const type = typeSelect.value;
  if (!title) {
    alert('Judul transaksi wajib diisi.');
    titleInput.focus();
    return null;
  }
  if (!Number.isFinite(amount) || amount < 1) {
    alert('Nominal transaksi harus lebih besar dari 0.');
    amountInput.focus();
    return null;
  }
  if (!date) {
    alert('Tanggal transaksi wajib diisi.');
    dateInput.focus();
    return null;
  }
  if (type !== 'income' && type !== 'expense') {
    alert('Tipe transaksi tidak valid.');
    typeSelect.focus();
    return null;
  }
  return { title, amount, date, type };
}

function handleTransactionSubmit(event) {
  event.preventDefault();
  if (!storageReady) {
    showStorageMessage('Penyimpanan tidak tersedia. Data tidak diubah.');
    return;
  }
  const formData = readFormTransaction();
  if (!formData) return;

  const nextTransactions = editingTransactionId === null
    ? [...transactions, { id: createUniqueId(), ...formData }]
    : transactions.map((transaction) => (
      String(transaction.id) === String(editingTransactionId)
        ? { ...transaction, ...formData }
        : transaction
    ));
  if (commitTransactions(nextTransactions)) resetForm();
}

function deleteTransaction(id) {
  if (!storageReady) return;
  const nextTransactions = transactions.filter((transaction) => String(transaction.id) !== String(id));
  if (nextTransactions.length === transactions.length) return;
  if (commitTransactions(nextTransactions) && String(editingTransactionId) === String(id)) resetForm();
}

function toggleTransactionType(id) {
  if (!storageReady) return;
  const nextTransactions = transactions.map((transaction) => (
    String(transaction.id) === String(id)
      ? { ...transaction, type: transaction.type === 'income' ? 'expense' : 'income' }
      : transaction
  ));
  if (commitTransactions(nextTransactions) && String(editingTransactionId) === String(id)) {
    const changed = nextTransactions.find((transaction) => String(transaction.id) === String(id));
    typeSelect.value = changed.type;
  }
}

function applySearch() {
  searchKeyword = searchInput.value;
  render();
}

transactions = loadTransactions();
transactionForm.addEventListener('submit', handleTransactionSubmit);
searchInput.addEventListener('input', applySearch);
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  applySearch();
});
document.addEventListener(UPDATE_EVENT, () => {
  render();
  updateDashboard();
});

dateInput.value = createLocalDateValue();
document.dispatchEvent(new CustomEvent(UPDATE_EVENT));
