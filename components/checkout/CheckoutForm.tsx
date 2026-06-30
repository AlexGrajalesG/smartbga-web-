"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCarrito } from "@/lib/store/carrito";
import { crearOrden, guardarDireccion, calcularCostoEnvio } from "@/app/(shop)/checkout/actions";
import { precioParaMetodo } from "@/lib/precios";
import { Wallet, Loader2, AlertCircle, MapPin, ShieldCheck } from "lucide-react";
import type { MetodoPago } from "@/types";

interface PerfilCheckout {
  nombre: string;
  celular: string | null;
  ciudad: string | null;
  barrio: string | null;
  direccion: string | null;
  departamento: string | null;
}

const METODOS_PAGO: { key: MetodoPago; label: string; nota: string }[] = [
  { key: "efectivo",     label: "Pago contraentrega",           nota: "Pagas en efectivo cuando recibes tu pedido" },
  { key: "addi",         label: "Addi — paga después",          nota: "Llévatelo hoy y paga después · sin cuota inicial" },
  { key: "sistecredito", label: "Sistecrédito — paga después",  nota: "Llévatelo hoy y paga después · sin cuota inicial" },
  { key: "wompi",        label: "Tarjeta / PSE / Nequi / Daviplata", nota: "Paga en línea de forma segura · impulsado por Wompi (Bancolombia)" },
];

// El pago contraentrega solo aplica dentro de Bucaramanga y su área metropolitana.
// Para el resto de municipios solo se ofrecen métodos de pago en línea.
const AREA_METROPOLITANA_BGA = ["bucaramanga", "floridablanca", "giron", "piedecuesta"];

function normalizarTexto(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const DEPARTAMENTOS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá",
  "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó",
  "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira",
  "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío",
  "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
  "Valle del Cauca", "Vaupés", "Vichada", "Bogotá D.C.",
].sort();

const inputCls = "w-full px-3.5 py-2.5 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6a0008]/20 focus:border-[#6a0008] transition-colors bg-white";
const labelCls = "text-sm font-medium text-neutral-700";

export default function CheckoutForm({ perfil }: { perfil: PerfilCheckout | null }) {
  const router = useRouter();
  const { items, vaciar } = useCarrito();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const enviado = useRef(false);

  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [celular, setCelular] = useState(perfil?.celular ?? "");
  const [departamento, setDepartamento] = useState(perfil?.departamento ?? "Santander");
  const [ciudad, setCiudad] = useState(perfil?.ciudad ?? "");
  const [barrio, setBarrio] = useState(perfil?.barrio ?? "");
  const [calle, setCalle] = useState(perfil?.direccion ?? "");
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo");
  const [guardarDir, setGuardarDir] = useState(false);

  const enAreaMetropolitana =
    departamento === "Santander" && AREA_METROPOLITANA_BGA.includes(normalizarTexto(ciudad));
  const metodosDisponibles = METODOS_PAGO;

  const subtotalPorMetodo = (metodo: MetodoPago) =>
    items.reduce((acc, { producto, cantidad }) => acc + precioParaMetodo(producto, metodo) * cantidad, 0);
  const subtotal = subtotalPorMetodo(metodoPago);
  const costoEnvio = calcularCostoEnvio(subtotal, ciudad, departamento);
  const total = subtotal + costoEnvio;

  const montosPorMetodo = Object.fromEntries(
    metodosDisponibles.map(({ key }) => [key, subtotalPorMetodo(key) + calcularCostoEnvio(subtotalPorMetodo(key), ciudad, departamento)])
  ) as Record<MetodoPago, number>;
  const montoMinimo = Math.min(...Object.values(montosPorMetodo));
  const hayDiferenciaDePrecio = Object.values(montosPorMetodo).some((m) => m !== montoMinimo);

  useEffect(() => {
    if (!enviado.current && items.length === 0) router.replace("/carrito");
  }, [items.length, router]);

  useEffect(() => {
    if (metodoPago === "efectivo" && !enAreaMetropolitana) {
      setMetodoPago("wompi");
    }
  }, [enAreaMetropolitana, metodoPago]);

  if (items.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !celular.trim() || !calle.trim() || !ciudad.trim()) {
      setError("Completa nombre, celular, dirección y ciudad.");
      return;
    }

    const partes = [
      calle.trim(),
      barrio.trim() && `Barrio ${barrio.trim()}`,
      ciudad.trim(),
      departamento,
    ].filter(Boolean).join(", ");
    const direccionCompleta = `${partes} (${nombre.trim()})`;

    startTransition(async () => {
      try {
        if (guardarDir) {
          await guardarDireccion({
            celular: celular.trim(),
            ciudad: ciudad.trim(),
            barrio: barrio.trim(),
            direccion: calle.trim(),
            departamento,
          });
        }

        const { id, wompiUrl, addiUrl } = await crearOrden({
          items: items.map(({ producto, cantidad }) => ({ producto_id: producto.id, cantidad })),
          direccion_envio: direccionCompleta,
          celular_contacto: celular.trim(),
          metodo_pago: metodoPago,
          ciudad: ciudad.trim(),
          departamento,
          notas: notas.trim() || undefined,
        });
        enviado.current = true;
        vaciar();
        if (wompiUrl) {
          window.location.href = wompiUrl;
        } else if (addiUrl) {
          window.location.href = addiUrl;
        } else {
          router.push(`/pedido/${id}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No pudimos procesar tu pedido. Intenta de nuevo.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_22rem] gap-8 items-start">
      {/* Columna izquierda: formulario */}
      <div className="flex flex-col gap-5">

        {/* Sección: datos del destinatario */}
        <div className="rounded-lg shadow-ambient p-5 flex flex-col gap-4 bg-white">
          <h2 className="font-display text-lg font-semibold text-[#1C0A0A]">Datos del destinatario</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nombre" className={labelCls}>Nombre completo</label>
              <input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className={inputCls}
                placeholder="Nombre de quien recibe"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="celular" className={labelCls}>Celular de contacto</label>
              <input
                id="celular"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                required
                type="tel"
                className={inputCls}
                placeholder="300 000 0000"
              />
            </div>
          </div>
        </div>

        {/* Sección: dirección de entrega */}
        <div className="rounded-lg shadow-ambient p-5 flex flex-col gap-4 bg-white">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-[#6a0008]" />
            <h2 className="font-display text-lg font-semibold text-[#1C0A0A]">Dirección de entrega</h2>
          </div>

          {/* Departamento + Ciudad */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="departamento" className={labelCls}>Departamento</label>
              <select
                id="departamento"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                required
                className={inputCls}
              >
                {DEPARTAMENTOS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ciudad" className={labelCls}>Ciudad / Municipio</label>
              <input
                id="ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                required
                className={inputCls}
                placeholder="Ej. Bucaramanga"
              />
            </div>
          </div>

          {/* Dirección + Barrio */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="calle" className={labelCls}>Dirección</label>
              <input
                id="calle"
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
                required
                className={inputCls}
                placeholder="Ej. Cra 27a No 15-01"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="barrio" className={labelCls}>
                Barrio <span className="text-[#6B5B52] font-normal">(opcional)</span>
              </label>
              <input
                id="barrio"
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                className={inputCls}
                placeholder="Ej. La Concordia"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notas" className={labelCls}>
              Notas adicionales <span className="text-[#6B5B52] font-normal">(opcional)</span>
            </label>
            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Ej. Dejar con portería, llamar antes de subir…"
            />
          </div>

          {/* Guardar dirección */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={guardarDir}
              onChange={(e) => setGuardarDir(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 accent-[#6a0008] cursor-pointer"
            />
            <span className="text-sm text-neutral-600 group-hover:text-neutral-800 transition-colors">
              Guardar esta dirección para futuras compras
            </span>
          </label>
        </div>

        {/* Sección: método de pago */}
        <div className="rounded-lg bg-[#F5F3EE] overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <Wallet size={14} className="text-[#6a0008]" />
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
              Método de pago
            </span>
          </div>
          <div className="flex flex-col">
            {metodosDisponibles.map(({ key, label, nota }, i) => {
              const esContraentrega = key === "efectivo";
              const deshabilitado = esContraentrega && !enAreaMetropolitana;
              const activo = metodoPago === key;
              const monto = montosPorMetodo[key];
              const esMasBarato = monto === montoMinimo && hayDiferenciaDePrecio;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => !deshabilitado && setMetodoPago(key)}
                  aria-pressed={activo}
                  disabled={deshabilitado}
                  className={`flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                    i !== metodosDisponibles.length - 1 ? "border-b border-neutral-200/70" : ""
                  } ${deshabilitado
                      ? "opacity-40 cursor-not-allowed"
                      : activo
                        ? "bg-[#6a0008]/[0.06] cursor-pointer"
                        : "hover:bg-neutral-100/70 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        activo ? "border-[#6a0008]" : "border-neutral-300"
                      }`}
                    >
                      {activo && <span className="w-2 h-2 rounded-full bg-[#6a0008]" />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-[#1C0A0A]">{label}</p>
                        {key === "wompi" && <ShieldCheck size={13} className="text-green-600 flex-shrink-0" />}
                        {deshabilitado && (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            Solo BGA y área metropolitana
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B5B52]">{nota}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[#1C0A0A] whitespace-nowrap tabular-nums">
                      ${monto.toLocaleString("es-CO")}
                    </span>
                    {esMasBarato && (
                      <p className="text-[10px] font-semibold text-green-600 whitespace-nowrap">Más económico</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Columna derecha: resumen */}
      <div className="rounded-lg shadow-ambient p-5 flex flex-col gap-4 lg:sticky lg:top-24 bg-white">
        <h2 className="font-display text-lg font-semibold text-[#1C0A0A]">Resumen del pedido</h2>

        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {items.map(({ producto, cantidad }) => (
            <div key={producto.id} className="flex gap-3 items-center">
              <div className="relative w-14 h-14 rounded-md overflow-hidden bg-neutral-50 flex-shrink-0 ring-1 ring-neutral-100">
                {producto.imagenes?.[0] && (
                  <Image src={producto.imagenes[0]} alt={producto.nombre} fill className="object-cover" sizes="56px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1C0A0A] truncate">{producto.nombre}</p>
                <p className="text-xs text-[#6B5B52]">Cantidad: {cantidad}</p>
              </div>
              <p className="text-sm font-semibold text-[#1C0A0A] whitespace-nowrap tabular-nums">
                ${(precioParaMetodo(producto, metodoPago) * cantidad).toLocaleString("es-CO")}
              </p>
            </div>
          ))}
        </div>

        <div className="h-px bg-neutral-100" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B5B52]">Subtotal</span>
            <span className="tabular-nums text-neutral-700">${subtotal.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B5B52]">Envío</span>
            {costoEnvio === 0 ? (
              <span className="font-semibold text-green-600">Gratis</span>
            ) : (
              <span className="tabular-nums text-neutral-700">${costoEnvio.toLocaleString("es-CO")}</span>
            )}
          </div>
          {!enAreaMetropolitana && costoEnvio > 0 && (
            <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-md leading-snug">
              Agrega <strong>${(90_000 - subtotal).toLocaleString("es-CO")}</strong> más para envío gratis
            </p>
          )}
        </div>

        <div className="h-px bg-neutral-100" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1C0A0A]">Total</span>
          <span className="text-xl font-bold text-[#1C0A0A] tabular-nums">
            ${total.toLocaleString("es-CO")}
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-md">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pendiente}
          className="w-full py-3.5 bg-[#6a0008] hover:bg-[#8C1A1A] text-white font-bold text-sm rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
        >
          {pendiente && <Loader2 size={16} className="animate-spin" />}
          {pendiente
            ? (metodoPago === "wompi" ? "Preparando pago…" : metodoPago === "addi" ? "Preparando Addi…" : "Procesando…")
            : (metodoPago === "wompi" ? "Continuar al pago seguro →" : metodoPago === "addi" ? "Continuar con Addi →" : "Confirmar pedido")}
        </button>

        {metodoPago === "wompi" && (
          <p className="text-[11px] text-[#6B5B52] text-center leading-relaxed flex items-center justify-center gap-1">
            <ShieldCheck size={11} className="text-green-500" />
            Pago seguro procesado por Wompi · Bancolombia
          </p>
        )}
        {metodoPago === "addi" && (
          <p className="text-[11px] text-[#6B5B52] text-center leading-relaxed">
            Serás redirigido a Addi para completar tu solicitud de crédito.
          </p>
        )}
        {metodoPago !== "wompi" && metodoPago !== "addi" && (
          <p className="text-[11px] text-[#6B5B52] text-center leading-relaxed">
            Al confirmar aceptas que nos contactemos contigo para coordinar la entrega.
          </p>
        )}
      </div>
    </form>
  );
}
