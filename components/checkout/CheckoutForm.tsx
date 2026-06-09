"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCarrito } from "@/lib/store/carrito";
import { crearOrden } from "@/app/(shop)/checkout/actions";
import { Wallet, Loader2, AlertCircle, MapPin } from "lucide-react";
import type { MetodoPago } from "@/types";

interface PerfilCheckout {
  nombre: string;
  celular: string | null;
  ciudad: string | null;
  barrio: string | null;
}

const METODOS_PAGO: { key: MetodoPago; label: string; nota: string }[] = [
  { key: "efectivo", label: "Pago contraentrega", nota: "Pagas en efectivo cuando recibes tu pedido" },
  { key: "transferencia", label: "Transferencia o PSE", nota: "Te enviamos los datos para transferir antes del envío" },
  { key: "addi", label: "Addi — paga después", nota: "Llévatelo hoy y paga después · sin cuota inicial" },
];

const DEPARTAMENTOS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá",
  "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó",
  "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira",
  "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío",
  "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
  "Valle del Cauca", "Vaupés", "Vichada", "Bogotá D.C.",
].sort();

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1A1A]/30 focus:border-[#8C1A1A] transition-colors bg-white";
const labelCls = "text-sm font-medium text-neutral-700";

export default function CheckoutForm({ perfil }: { perfil: PerfilCheckout | null }) {
  const router = useRouter();
  const { items, total, vaciar } = useCarrito();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const enviado = useRef(false);

  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [celular, setCelular] = useState(perfil?.celular ?? "");
  const [departamento, setDepartamento] = useState("Santander");
  const [ciudad, setCiudad] = useState(perfil?.ciudad ?? "");
  const [barrio, setBarrio] = useState(perfil?.barrio ?? "");
  const [calle, setCalle] = useState("");
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo");

  useEffect(() => {
    if (!enviado.current && items.length === 0) router.replace("/carrito");
  }, [items.length, router]);

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
        const { id } = await crearOrden({
          items: items.map(({ producto, cantidad }) => ({ producto_id: producto.id, cantidad })),
          direccion_envio: direccionCompleta,
          celular_contacto: celular.trim(),
          metodo_pago: metodoPago,
          notas: notas.trim() || undefined,
        });
        enviado.current = true;
        vaciar();
        router.push(`/pedido/${id}`);
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
        <div className="rounded-2xl border border-neutral-200 p-5 flex flex-col gap-4 bg-white">
          <h2 className="font-semibold text-neutral-900 text-base">Datos del destinatario</h2>

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
        <div className="rounded-2xl border border-neutral-200 p-5 flex flex-col gap-4 bg-white">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-[#8C1A1A]" />
            <h2 className="font-semibold text-neutral-900 text-base">Dirección de entrega</h2>
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
                Barrio <span className="text-neutral-400 font-normal">(opcional)</span>
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
              Notas adicionales <span className="text-neutral-400 font-normal">(opcional)</span>
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
        </div>

        {/* Sección: método de pago */}
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <Wallet size={14} className="text-[#8C1A1A]" />
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
              Método de pago
            </span>
          </div>
          <div className="flex flex-col">
            {METODOS_PAGO.map(({ key, label, nota }, i) => {
              const activo = metodoPago === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMetodoPago(key)}
                  aria-pressed={activo}
                  className={`flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                    i !== METODOS_PAGO.length - 1 ? "border-b border-neutral-200/70" : ""
                  } ${activo ? "bg-[#8C1A1A]/[0.07]" : "hover:bg-neutral-100/70"}`}
                >
                  <span
                    className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      activo ? "border-[#8C1A1A]" : "border-neutral-300"
                    }`}
                  >
                    {activo && <span className="w-2 h-2 rounded-full bg-[#8C1A1A]" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{label}</p>
                    <p className="text-xs text-neutral-400">{nota}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Columna derecha: resumen */}
      <div className="rounded-2xl border border-neutral-200 p-5 flex flex-col gap-4 lg:sticky lg:top-24 bg-white">
        <h2 className="font-semibold text-neutral-900">Resumen del pedido</h2>

        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {items.map(({ producto, cantidad }) => (
            <div key={producto.id} className="flex gap-3 items-center">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0 ring-1 ring-neutral-100">
                {producto.imagenes?.[0] && (
                  <Image src={producto.imagenes[0]} alt={producto.nombre} fill className="object-cover" sizes="56px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{producto.nombre}</p>
                <p className="text-xs text-neutral-400">Cantidad: {cantidad}</p>
              </div>
              <p className="text-sm font-semibold text-neutral-900 whitespace-nowrap tabular-nums">
                ${(producto.precio_venta * cantidad).toLocaleString("es-CO")}
              </p>
            </div>
          ))}
        </div>

        <div className="h-px bg-neutral-100" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Total</span>
          <span className="text-xl font-bold text-neutral-900 tabular-nums">
            ${total().toLocaleString("es-CO")}
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pendiente}
          className="w-full py-3.5 bg-[#8C1A1A] hover:bg-[#6B1313] text-white font-bold text-sm rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
        >
          {pendiente && <Loader2 size={16} className="animate-spin" />}
          {pendiente ? "Procesando…" : "Confirmar pedido"}
        </button>

        <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
          Al confirmar aceptas que nos contactemos contigo para coordinar la entrega.
        </p>
      </div>
    </form>
  );
}
