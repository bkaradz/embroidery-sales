export const paymentList = [
  {
    value: 'Cash',
    label: 'Cash'
  },
  {
    value: 'Bank',
    label: 'Bank'
  },
  {
    value: 'Mobile',
    label: 'Mobile Payment'
  },
  {
    value: 'Card',
    label: 'Bank Card'
  }
];

export const bankList = [
  {
    value: 'bancABC',
    label: 'Banc ABC'
  },
  {
    value: 'stewartBank',
    label: 'Stewart Bank'
  }
];

export const mobilePaymentList = [
  {
    value: 'ecoCash',
    label: 'Eco Cash'
  },
  {
    value: 'oneMoney',
    label: 'One Money'
  }
];

export const status = [
  { value: 'Quotation', label: 'Quotation' },
  { value: 'Sales Order', label: 'Sales Order' },
  { value: 'Invoice', label: 'Invoice' }
];

export const productCategories = [
  'Embroidery',
  'Services',
  'Threads',
  'Needles',
  'Backing',
  'Prewound Bobbin',
  'Trimmers',
  'Bobbin Case',
  'Golf Shirts',
  'Round Neck',
  'Work Suit',
  'Cap',
  'Other'
] as const;

export type ProductCategories = typeof productCategories[number];