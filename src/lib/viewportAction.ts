let intersectionObserver: IntersectionObserver;

function ensureIntersectionObserver({ onEnter, onExit }: { onEnter?: () => void, onExit?: () => void }) {
    if (intersectionObserver) return;

    intersectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                // const eventName = entry.isIntersecting ? 'enterViewport' : 'exitViewport';
                // entry.target.dispatchEvent(new CustomEvent(eventName));
                const a = entry.isIntersecting ? onEnter : onExit;
                a?.();
            });
        }
    );
}

export default function viewport(element: Element, { onEnter, onExit }: { onEnter?: () => void, onExit?: () => void }) {
    ensureIntersectionObserver({ onEnter, onExit });

    intersectionObserver.observe(element);

    return {
        destroy() {
            intersectionObserver.unobserve(element);
        }
    }
}