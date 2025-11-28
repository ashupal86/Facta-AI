interface MaterialIconProps {
    icon: string;
    className?: string;
    size?: number;
}

export default function MaterialIcon({ icon, className = '', size }: MaterialIconProps) {
    return (
        <span
            className={`material-symbols-outlined ${className}`}
            style={size ? { fontSize: `${size}px` } : undefined}
        >
            {icon}
        </span>
    );
}
