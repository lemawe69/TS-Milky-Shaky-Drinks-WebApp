import api from './api'

export async function listPaymentMethods() {
  const res = await api.get('/users/payment-methods')
  return res.data
}

export async function addPaymentMethod(data) {
  const res = await api.post('/users/payment-methods', data)
  return res.data
}

export async function deletePaymentMethod(id) {
  const res = await api.delete(`/users/payment-methods/${id}`)
  return res.data
}
