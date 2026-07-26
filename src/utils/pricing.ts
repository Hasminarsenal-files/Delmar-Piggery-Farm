export const PIGLET_TYPES = [
  { key: "regular", label: "Regular Piglet", price: 3500 },
  { key: "sowlet", label: "Sowlet", price: 6500 },
  { key: "boarlet", label: "Boarlet", price: 5000 },
  { key: "fattening", label: "Fattening", price: 200 },
];

export const LECHON_SIZES = [
  { key: "15kg", label: "Small Lechon (15 kg)", price: 6500 },
  { key: "20kg", label: "Small Lechon (20 kg)", price: 7500 },
  { key: "25kg", label: "Small Lechon (25 kg)", price: 8500 },
  { key: "30kg", label: "Medium Lechon (30 kg)", price: 9500 },
  { key: "35kg", label: "Medium Lechon (35 kg)", price: 10500 },
  { key: "40kg", label: "Medium Lechon (40 kg)", price: 11500 },
  { key: "45kg", label: "Large Lechon (45 kg)", price: 12500 },
  { key: "50kg", label: "Large Lechon (50 kg)", price: 13500 },
  { key: "55kg", label: "Large Lechon (55 kg)", price: 14500 },
];

export const CATERING_BUFFETS = [
  { key: "set-a", label: "Catering Buffet Set A (P250/pax)", price: 250 },
  { key: "set-b", label: "Catering Buffet Set B (P290/pax)", price: 290 },
  { key: "set-c", label: "Catering Buffet Set C (P340/pax)", price: 340 },
];

export const SWEETS_PACKAGES = [
  { key: "sweet-a", label: "Sweets Package Set A", price: 3650 },
  { key: "sweet-b", label: "Sweets Package Set B", price: 5500 },
  { key: "sweet-c", label: "Sweets Package Set C", price: 7500 },
];

export const getReservationDetails = (category: string, price: number, quantity: number) => {
  const unitPrice = quantity > 0 ? Math.round(price / quantity) : price;

  if (category === "Piglets") {
    const found = PIGLET_TYPES.find((p) => p.price === unitPrice);
    return found ? `Piglets (${found.label})` : "Weanling Piglets";
  }

  if (category === "Crispylicious Lechon") {
    const found = LECHON_SIZES.find((l) => l.price === unitPrice);
    return found ? `Crispylicious Lechon (${found.key})` : "Crispylicious Lechon";
  }

  if (category === "Catering Services") {
    const foundBuffet = CATERING_BUFFETS.find((b) => b.price === unitPrice);
    if (foundBuffet) return `Catering Services (${foundBuffet.label.split(" (")[0]})`;

    const foundSweet = SWEETS_PACKAGES.find((s) => s.price === unitPrice);
    if (foundSweet) return `Catering Services (${foundSweet.label})`;

    return "Catering Services";
  }

  return category;
};
