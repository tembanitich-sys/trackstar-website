/**
 * The slim navy bar above the header. It used to carry the InstaTickets pre-registration notice; that no longer
 * applies, so it is now just the bar (decorative, nothing to read). Change `h-10` to make it thinner or taller.
 */
export function TopStrip() {
  return <div aria-hidden="true" className="h-10 bg-navy" />;
}
