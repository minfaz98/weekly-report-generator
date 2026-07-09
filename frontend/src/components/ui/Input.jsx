export default function Input({ label, error, register, name, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>

      <input
        type={type}
        {...register(name)}
        className="w-full rounded-lg border px-3 py-3 outline-none focus:border-blue-500"
      />

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
