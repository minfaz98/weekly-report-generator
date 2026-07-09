export default function Button({
  children,
  loading = false,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      disabled={loading}
      className={`w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 ${className}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
