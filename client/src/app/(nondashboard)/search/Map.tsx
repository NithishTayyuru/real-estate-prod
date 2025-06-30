"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import  { Property } from "@/types/prismaTypes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
  const mapContainerRef = useRef(null);
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  useEffect(() => {
    if (isLoading || isError || !properties) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/nithish17/cmc5zfcc200ka01sbagl5272t",
      center: filters.coordinates || [-74.5, 40],
      zoom: 9,
    });

    properties.forEach((property) => {
      const marker = createPropertyMarker(property, map);
      const markerElement = marker.getElement();
      const path = markerElement.querySelector("path[fill='#3FB1CE']");
      if (path) path.setAttribute("fill", "#000000");
    });

    const resizeMap = () => {
      if (map) setTimeout(() => map.resize(), 700);
    };
    resizeMap();

    return () => map.remove();
  }, [isLoading, isError, properties, filters.coordinates]);

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        className="map-container rounded-xl"
        ref={mapContainerRef}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
      <style jsx global>{`
        .mapboxgl-popup-content {
          background: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
          border-radius: 8px !important;
          padding: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }
        
        .mapboxgl-popup-tip {
          border-top-color: rgba(0, 0, 0, 0.8) !important;
        }
        
        .marker-popup {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .marker-popup-image {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          flex-shrink: 0;
        }
        
        .marker-popup-title {
          color: white !important;
          text-decoration: none !important;
          font-weight: 600;
          font-size: 14px;
          line-height: 1.2;
        }
        
        .marker-popup-title:hover {
          color: #3FB1CE !important;
        }
        
        .marker-popup-price {
          margin: 4px 0 0 0 !important;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8) !important;
        }
        
        .marker-popup-price-unit {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6) !important;
        }
        
        .mapboxgl-popup-close-button {
          color: white !important;
          font-size: 18px !important;
        }
        
        .mapboxgl-popup-close-button:hover {
          color: #3FB1CE !important;
        }
      `}</style>
    </div>
  );
};

const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
  const marker = new mapboxgl.Marker()
    .setLngLat([
      property.location.coordinates.longitude,
      property.location.coordinates.latitude,
    ])
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
            <p class="marker-popup-price">
              $${property.pricePerMonth}
              <span class="marker-popup-price-unit"> / month</span>
            </p>
          </div>
        </div>
        `
      )
    )
    .addTo(map);
  return marker;
};

export default Map;