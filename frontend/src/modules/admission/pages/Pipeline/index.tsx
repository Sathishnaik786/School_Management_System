import React, { useState } from 'react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { KanbanCardData } from '../../components/kanban/Card';

export function PipelinePage() {
    // Demonstration mock cards for Kanban Pipeline Board
    const [cards, setCards] = useState<KanbanCardData[]>([
        { id: '1', code: 'APP00124', name: 'Rohan Sharma', grade: '5', status: 'DOCUMENT_CHECK', counselor: 'Nancy Gates', score: 89, slaProgress: 60, slaStatus: 'normal', documentStatus: 'pending', updatedAt: '2 hours ago' },
        { id: '2', code: 'APP00142', name: 'Preeti Deshmukh', grade: '12', status: 'INTERVIEW', counselor: 'Nancy Gates', score: 94, slaProgress: 95, slaStatus: 'warning', documentStatus: 'complete', updatedAt: '1 hour ago' },
        { id: '3', code: 'APP00118', name: 'Amit Kumar', grade: '5', status: 'NEW', counselor: 'Unassigned', slaProgress: 10, slaStatus: 'normal', documentStatus: 'pending', updatedAt: 'Just now' },
        { id: '4', code: 'APP00155', name: 'Sagar Sen', grade: '2', status: 'NEW', counselor: 'Nancy Gates', score: 76, slaProgress: 100, slaStatus: 'breached', documentStatus: 'missing', updatedAt: '3 hours ago' },
        { id: '5', code: 'APP00109', name: 'Karan Malhotra', grade: '11', status: 'MERIT_LIST', counselor: 'Nancy Gates', score: 92, slaProgress: 40, slaStatus: 'normal', documentStatus: 'complete', updatedAt: '4 hours ago' },
        { id: '6', code: 'APP00102', name: 'Reema Jain', grade: '8', status: 'FEES_PENDING', counselor: 'Nancy Gates', score: 85, slaProgress: 80, slaStatus: 'warning', documentStatus: 'complete', updatedAt: '1 day ago' },
    ]);

    const handleStageTransition = (cardId: string, fromStage: string, toStage: string) => {
        // Safe transition: updates card status state locally to simulate presentation API dispatch
        setCards(prev => prev.map(card => {
            if (card.id === cardId) {
                return {
                    ...card,
                    status: toStage,
                    updatedAt: 'Just now'
                };
            }
            return card;
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    Admissions Pipeline Board
                </h2>
                <p className="text-xs text-gray-400 font-semibold uppercase">
                    Drag and drop cards across pipeline columns to trigger workflow stage transitions
                </p>
            </div>

            <KanbanBoard 
                cards={cards}
                onStageTransition={handleStageTransition}
                onCardClick={(id) => console.log('click card', id)}
            />
        </div>
    );
}

export default PipelinePage;
