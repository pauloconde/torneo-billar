import React from "react";
import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function PlanillaModal({ open, onClose, imgUrl }) {
  if (!open) return null;

  // Puedes ajustar estos valores si tienes el tamaño real de tus imágenes
  const DEFAULT_WIDTH = 800;
  const DEFAULT_HEIGHT = 1200;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.8)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#0F172B",
          borderRadius: 8,
          width: "95vw", height: "90vh",
          maxWidth: 600, maxHeight: "90vh",
          display: "flex", flexDirection: "column", boxShadow: "0 2px 16px rgba(0,0,0,0.25)"
        }}
      >
        <button
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            zIndex: 2,
            background: "#0F172B",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            fontSize: 20,
            cursor: "pointer"
          }}
          aria-label="Cerrar"
          onClick={onClose}
        >✕</button>
        <div style={{ width: "100%", height: "100%", overflow: "hidden", marginTop: 40 }}>
          {imgUrl ? (
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={6}
              doubleClick={{ mode: "zoomIn" }}
              wheel={{ step: 0.2 }}
              pinch={{ step: 1 }}
              panning={{ disabled: false }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div style={{ margin: "0 0 8px 0", textAlign: "center" }}>
                    <button onClick={zoomIn} style={zoomBtnStyle}>+</button>
                    <button onClick={zoomOut} style={{ ...zoomBtnStyle, marginLeft: 8 }}>-</button>
                    <button onClick={resetTransform} style={{ ...zoomBtnStyle, marginLeft: 8 }}>Reset</button>
                  </div>
                  <TransformComponent>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <Image
                        src={imgUrl}
                        alt="Planilla"
                        width={DEFAULT_WIDTH}
                        height={DEFAULT_HEIGHT}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "75vh",
                          display: "block",
                          margin: "0 auto",
                          userSelect: "none"
                        }}
                        unoptimized
                        draggable={false}
                        priority
                      />
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          ) : (
            <div style={{ textAlign: "center", marginTop: "40%" }}>Cargando...</div>
          )}
        </div>
      </div>
    </div>
  );
}

const zoomBtnStyle = {
  background: "#0F172B",
  border: "1px solid #ccc",
  borderRadius: 4,
  padding: "4px 12px",
  fontSize: 18,
  cursor: "pointer"
};