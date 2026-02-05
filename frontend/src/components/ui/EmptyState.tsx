export const EmptyState = ({
    title = "No data found",
    description = "There are no items to display at this time.",
    action
}: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
}) => (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="text-4xl mb-4 text-gray-300">📁</div>
        <h3 className="text-lg font-bold text-gray-700">{title}</h3>
        <p className="text-gray-500 max-w-xs mt-1">{description}</p>
        {action && <div className="mt-6">{action}</div>}
    </div>
);
