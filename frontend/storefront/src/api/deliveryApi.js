import axiosClient from './axiosClient.js';

export async function listDeliveryZones() {
  const { data } = await axiosClient.get('/delivery/zones');
  return data.data.zones;
}

// Called live as the customer picks/changes their delivery city at
// checkout, so pay-on-delivery can be greyed out immediately rather than
// letting them pick it and failing on submit — see order.service.js,
// which is where this is actually enforced server-side.
export async function checkPodEligibility(cityId) {
  const { data } = await axiosClient.get(`/delivery/zones/${cityId}/pod-check`);
  return data.data;
}
