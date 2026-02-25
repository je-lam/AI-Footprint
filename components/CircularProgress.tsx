interface CircularProgressProps {
    emoji: string;
    label: string;
    totalLiters: number;
    waterPerItemL: number;
    ringColorClass: string;
}

const CircularProgress = ({
    emoji,
    label,
    totalLiters,
    waterPerItemL,
    ringColorClass
}: CircularProgressProps) => {

    const completedItems = Math.floor(totalLiters / waterPerItemL);
    const remainderLiters = totalLiters % waterPerItemL;
    const percentage = (remainderLiters / waterPerItemL) * 100;

    const radius = 15.9155;
    const circumference = 2 * Math.PI * radius;
    const displayPercentage = Math.min(percentage, 100);
    const strokeDasharray = `${(displayPercentage * circumference) / 100} ${circumference}`;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-[76px] h-[76px] mb-3">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        className="text-gray-200"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className={ringColorClass}
                        strokeDasharray={strokeDasharray}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-3xl">
                    {emoji}
                </div>
            </div>
            <div className="text-[15px] font-semibold text-gray-900 leading-tight">
                {completedItems.toLocaleString()}
            </div>
            <div className="text-[13px] text-gray-800 font-medium">{label}</div>
        </div>
    );
};

export default CircularProgress;