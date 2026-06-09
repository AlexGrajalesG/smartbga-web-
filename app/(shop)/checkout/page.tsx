import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout — SmartBga" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("nombre, celular, ciudad, barrio")
    .eq("auth_id", user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Finalizar compra</h1>
      <CheckoutForm perfil={perfil} />
    </div>
  );
}
