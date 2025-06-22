import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const StatCard = ({ title, value }) => {
    return (
        <Card className="bg-gray-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-400">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{value}</p>
            </CardContent>
        </Card>
    );
};

export default StatCard;