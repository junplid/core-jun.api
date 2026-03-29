interface Geo {
  lat: number;
  lng: number;
}

function distance(a: Geo, b: Geo) {
  const R = 6371; // km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function buildRoute(origin: Geo, orders: Geo[]) {
  const route = [];
  let current = origin;
  let remaining = [...orders];

  while (remaining.length) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    remaining.forEach((order, index) => {
      const dist = distance(current, order);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIndex = index;
      }
    });

    const next = remaining.splice(nearestIndex, 1)[0];
    route.push(next);
    current = next;
  }

  return route;
}

function generateGoogleMapsLink(
  origin: Geo,
  route: Geo[],
  mode: "driving" | "motorcycle" | "bicycling" | "walking" = "driving",
) {
  const originStr = `${origin.lat},${origin.lng}`;
  const destination = route[route.length - 1];
  const destinationStr = `${destination.lat},${destination.lng}`;

  const waypoints = route
    .slice(0, -1)
    .map((p) => `${p.lat},${p.lng}`)
    .join("|");

  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${originStr}` +
    `&destination=${destinationStr}` +
    (waypoints ? `&waypoints=${waypoints}` : "") +
    `&travelmode=${mode}`
  );
}

const loja: Geo = { lat: -12.864888, lng: -38.436123 };

const pedidos: Geo[] = [
  { lat: -12.861305, lng: -38.438095 },
  { lat: -12.864155, lng: -38.437657 },
  { lat: -12.866378, lng: -38.438707 },
];

const ordered = buildRoute(loja, pedidos);
const link = generateGoogleMapsLink(loja, ordered, "motorcycle");

console.log(link);
