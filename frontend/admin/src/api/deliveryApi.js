import axiosClient from './axiosClient.js';

export async function listZones(status = 'all') {
  const { data } = await axiosClient.get('/admin/delivery-zones', { params: { status } });
  return data.data.zones;
}

// { cityName, region?, payOnDeliveryEnabled, deliveryFee, estimatedDays? }
export async function createZone(payload) {
  const { data } = await axiosClient.post('/admin/delivery-zones', payload);
  return data.data.zone;
}

export async function updateZone(id, payload) {
  const { data } = await axiosClient.put(`/admin/delivery-zones/${id}`, payload);
  return data.data.zone;
}

// Deactivates, does not hard-delete (see delivery.service.js).
export async function deactivateZone(id) {
  const { data } = await axiosClient.delete(`/admin/delivery-zones/${id}`);
  return data.data.zone;
}
