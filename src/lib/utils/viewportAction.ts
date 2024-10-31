export default function viewport(element: Element, { onEnter, onExit }: { onEnter?: () => void, onExit?: () => void }) {

    const intersectionObserver: IntersectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const triggerEvent = entry.isIntersecting ? onEnter : onExit;
                triggerEvent?.();
            });
        }
    );;

    intersectionObserver.observe(element);

    return {
        destroy() {
            intersectionObserver.unobserve(element);
        }
    }
}