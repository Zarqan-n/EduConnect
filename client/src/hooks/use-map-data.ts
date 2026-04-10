import { useMemo } from "react";

interface MapMarker {
  id: number;
  name: string;
  type: "tutor" | "seller" | "institution" | "student";
  lat: number;
  lon: number;
  distance: number;
  details?: {
    rate?: number;
    subjects?: string[];
    price?: number;
    books?: number;
    jobs?: number;
    rating?: number;
    mode?: string;
    timings?: string;
    userId?: number;
    sellerId?: number;
  };
}

interface LocationSuggestion {
  displayName: string;
  lat: number;
  lon: number;
  address?: string;
}

interface RawData {
  tutors?: any[];
  books?: any[];
  jobs?: any[];
  students?: any[];
}

interface MapFilters {
  subject?: string;
  class?: string;
  feeMin?: number;
  feeMax?: number;
  mode?: "any" | "online" | "home" | "both";
  searchRadius?: number;
  sortBy?: "distance" | "price";
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const locationMatches = (itemLocation: string, selectedLocation: LocationSuggestion): boolean => {
  if (!itemLocation) return false;
  const loc = itemLocation.toLowerCase();
  const locationQuery = selectedLocation.displayName.toLowerCase();
  const fullAddress = (selectedLocation.address || selectedLocation.displayName).toLowerCase();

  if (loc.includes(locationQuery) || locationQuery.includes(loc)) return true;
  if (fullAddress.includes(loc) || loc.includes(fullAddress)) return true;

  const searchWords = fullAddress.split(/[\s,]+/).filter((w) => w.length > 2);
  const itemWords = loc.split(/[\s,]+/).filter((w) => w.length > 2);
  return searchWords.some((sw) => itemWords.some((iw) => sw.includes(iw) || iw.includes(sw)));
};

const offsetForId = (id: number, scale: number = 0.02) => {
  const angle = ((id * 137.508) % 360) * (Math.PI / 180);
  const r = scale * (0.3 + ((id * 7) % 10) / 10);
  return { lat: r * Math.cos(angle), lon: r * Math.sin(angle) };
};

function buildMarkers(
  userRole: string,
  selectedLocation: LocationSuggestion,
  rawData: RawData,
  filters: MapFilters,
): MapMarker[] {
  const newMarkers: MapMarker[] = [];

  if (userRole === "student") {
    if (rawData.tutors && Array.isArray(rawData.tutors)) {
      rawData.tutors.forEach((tutor: any) => {
        const tutorLocation = tutor.location || "";
        if (!locationMatches(tutorLocation, selectedLocation)) return;

        if (filters.mode !== "any") {
          const tutorMode = tutor.tutorProfile?.mode || "online";
          if (filters.mode !== "both" && tutorMode !== filters.mode) return;
        }

        const feeMax = filters.feeMax ?? Infinity;
        if ((tutor.tutorProfile?.monthlyRate ?? Infinity) > feeMax) return;

        const feeMin = filters.feeMin ?? 0;
        if ((tutor.tutorProfile?.monthlyRate ?? 0) < feeMin) return;

        if (filters.subject && tutor.tutorProfile?.subjects) {
          const hasSubject = tutor.tutorProfile.subjects.some((s: string) =>
            s.toLowerCase().includes(filters.subject!.toLowerCase()),
          );
          if (!hasSubject) return;
        }

        if (filters.class && tutor.tutorProfile?.classes) {
          const hasClass = tutor.tutorProfile.classes.some((c: string) =>
            c.toLowerCase().includes(filters.class!.toLowerCase()),
          );
          if (!hasClass) return;
        }

        const off = offsetForId(tutor.id || 0);
        const lat = selectedLocation.lat + off.lat;
        const lon = selectedLocation.lon + off.lon;
        const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

        if (distance <= (filters.searchRadius || 10)) {
          newMarkers.push({
            id: tutor.id,
            name: tutor.name || "Tutor",
            type: "tutor",
            lat,
            lon,
            distance,
            details: {
              rate: tutor.tutorProfile?.monthlyRate || 500,
              subjects: tutor.tutorProfile?.subjects || [],
              rating: tutor.tutorProfile?.rating ? tutor.tutorProfile.rating / 10 : 4.5,
              userId: tutor.id,
              mode: tutor.tutorProfile?.mode || "online",
              timings: tutor.tutorProfile?.timings || "",
            },
          });
        }
      });
    }

    if (rawData.jobs && Array.isArray(rawData.jobs)) {
      rawData.jobs.forEach((job: any) => {
        const jobLocation = job.location || job.institution?.location || "";
        if (!locationMatches(jobLocation, selectedLocation)) return;

        const off = offsetForId(2000 + (job.id || 0));
        const lat = selectedLocation.lat + off.lat;
        const lon = selectedLocation.lon + off.lon;
        const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

        if (distance <= (filters.searchRadius || 10)) {
          newMarkers.push({
            id: 2000 + (job.id || 0),
            name: job.title || "Job Post",
            type: "institution",
            lat,
            lon,
            distance,
            details: {
              jobs: 1,
            },
          });
        }
      });
    }

    if (rawData.books && Array.isArray(rawData.books)) {
      rawData.books.forEach((book: any) => {
        const bookLocation = book.location || book.seller?.location || "";
        if (!locationMatches(bookLocation, selectedLocation)) return;

        const off = offsetForId(1000 + (book.id || 0));
        const lat = selectedLocation.lat + off.lat;
        const lon = selectedLocation.lon + off.lon;
        const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

        if (distance <= (filters.searchRadius || 10)) {
          newMarkers.push({
            id: 1000 + (book.id || 0),
            name: book.title || "Book",
            type: "seller",
            lat,
            lon,
            distance,
            details: {
              price: book.price || 200,
              books: 1,
              sellerId: book.seller?.id,
            },
          });
        }
      });
    }
  } else if (userRole === "teacher") {
    if (rawData.students && Array.isArray(rawData.students)) {
      rawData.students.forEach((student: any) => {
        const studentLocation = student.location || "";
        if (!locationMatches(studentLocation, selectedLocation)) return;

        const off = offsetForId(3000 + (student.id || 0));
        const lat = selectedLocation.lat + off.lat;
        const lon = selectedLocation.lon + off.lon;
        const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

        if (distance <= (filters.searchRadius || 10)) {
          newMarkers.push({
            id: 3000 + (student.id || 0),
            name: student.name || "Student",
            type: "student",
            lat,
            lon,
            distance,
            details: {
              userId: student.id,
            },
          });
        }
      });
    }

    if (rawData.jobs && Array.isArray(rawData.jobs)) {
      rawData.jobs.forEach((job: any) => {
        const jobLocation = job.location || job.institution?.location || "";
        if (!locationMatches(jobLocation, selectedLocation)) return;

        const off = offsetForId(2000 + (job.id || 0));
        const lat = selectedLocation.lat + off.lat;
        const lon = selectedLocation.lon + off.lon;
        const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

        if (distance <= (filters.searchRadius || 10)) {
          newMarkers.push({
            id: 2000 + (job.id || 0),
            name: job.title || "Job Post",
            type: "institution",
            lat,
            lon,
            distance,
            details: {
              jobs: 1,
            },
          });
        }
      });
    }

    if (rawData.books && Array.isArray(rawData.books)) {
      rawData.books.forEach((book: any) => {
        const bookLocation = book.location || book.seller?.location || "";
        if (!locationMatches(bookLocation, selectedLocation)) return;

        const off = offsetForId(1000 + (book.id || 0));
        const lat = selectedLocation.lat + off.lat;
        const lon = selectedLocation.lon + off.lon;
        const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

        if (distance <= (filters.searchRadius || 10)) {
          newMarkers.push({
            id: 1000 + (book.id || 0),
            name: book.title || "Book",
            type: "seller",
            lat,
            lon,
            distance,
            details: {
              price: book.price || 200,
              books: 1,
              sellerId: book.seller?.id,
            },
          });
        }
      });
    }
  } else if (userRole === "institution") {
    if (rawData.tutors && Array.isArray(rawData.tutors)) {
      rawData.tutors.forEach((tutor: any) => {
        const tutorLocation = tutor.location || "";
        if (!locationMatches(tutorLocation, selectedLocation)) return;

        const off = offsetForId(tutor.id || 0);
        const lat = selectedLocation.lat + off.lat;
        const lon = selectedLocation.lon + off.lon;
        const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

        if (distance <= (filters.searchRadius || 10)) {
          newMarkers.push({
            id: tutor.id,
            name: tutor.name || "Tutor",
            type: "tutor",
            lat,
            lon,
            distance,
            details: {
              rate: tutor.tutorProfile?.monthlyRate || 500,
              subjects: tutor.tutorProfile?.subjects || [],
              rating: tutor.tutorProfile?.rating ? tutor.tutorProfile.rating / 10 : 4.5,
              userId: tutor.id,
              mode: tutor.tutorProfile?.mode || "online",
              timings: tutor.tutorProfile?.timings || "",
            },
          });
        }
      });
    }

    if (rawData.books && Array.isArray(rawData.books)) {
      rawData.books.forEach((book: any) => {
        const bookLocation = book.location || book.seller?.location || "";
        if (!locationMatches(bookLocation, selectedLocation)) return;

        const off = offsetForId(1000 + (book.id || 0));
        const lat = selectedLocation.lat + off.lat;
        const lon = selectedLocation.lon + off.lon;
        const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

        if (distance <= (filters.searchRadius || 10)) {
          newMarkers.push({
            id: 1000 + (book.id || 0),
            name: book.title || "Book",
            type: "seller",
            lat,
            lon,
            distance,
            details: {
              price: book.price || 200,
              books: 1,
              sellerId: book.seller?.id,
            },
          });
        }
      });
    }
  }

  return newMarkers.sort((a, b) => {
    if (filters.sortBy === "price") {
      const priceA = a.details?.price ?? a.details?.rate ?? 0;
      const priceB = b.details?.price ?? b.details?.rate ?? 0;
      return priceA - priceB;
    }
    return a.distance - b.distance;
  });
}

export function useMapData(
  userRole: string,
  selectedLocation: LocationSuggestion | null,
  rawData: RawData,
  filters: MapFilters,
) {
  const markers = useMemo(() => {
    if (!selectedLocation) return [];
    return buildMarkers(userRole, selectedLocation, rawData, filters);
  }, [userRole, selectedLocation, rawData, filters]);

  return { markers, isLoading: false };
}
