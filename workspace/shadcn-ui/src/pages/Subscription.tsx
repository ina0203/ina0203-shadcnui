import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    SUBSCRIPTION_PLANS,
    getUserSubscription,
    updateSubscription,
    SubscriptionTier
} from '@/lib/monetization';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Subscription() {
    const { user, refreshUser } = useAuth();
    const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');

    useEffect(() => {
        if (user) {
            const tier = getUserSubscription(user.id);
            setCurrentTier(tier);
        }
    }, [user]);

    const handleUpgrade = (tier: SubscriptionTier) => {
        if (!user) return;

        if (tier === currentTier) {
            toast.info('이미 이 플랜을 사용 중입니다');
            return;
        }

        // Simulate payment process
        updateSubscription(user.id, tier);
        setCurrentTier(tier);
        refreshUser();

        toast.success(`${tier === 'pro' ? 'Pro' : 'Premium'} 플랜으로 업그레이드되었습니다! 🎉`);
    };

    const getTierIcon = (tier: SubscriptionTier) => {
        switch (tier) {
            case 'free':
                return <Sparkles className="w-6 h-6" />;
            case 'pro':
                return <Zap className="w-6 h-6" />;
            case 'premium':
                return <Crown className="w-6 h-6" />;
        }
    };

    const getTierGradient = (tier: SubscriptionTier) => {
        switch (tier) {
            case 'free':
                return 'from-gray-500 to-gray-600';
            case 'pro':
                return 'from-blue-500 to-purple-600';
            case 'premium':
                return 'from-amber-500 to-orange-600';
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    구독 플랜
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    더 많은 기능을 사용하고 수익을 창출하세요
                </p>
                {currentTier !== 'free' && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg px-4 py-2">
                        현재 플랜: {currentTier === 'pro' ? 'Pro' : 'Premium'}
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {SUBSCRIPTION_PLANS.map((plan) => {
                    const isCurrentPlan = currentTier === plan.id;
                    const isUpgrade = (
                        (currentTier === 'free' && plan.id !== 'free') ||
                        (currentTier === 'pro' && plan.id === 'premium')
                    );

                    return (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden transition-all ${isCurrentPlan
                                    ? 'border-4 border-purple-500 shadow-2xl scale-105'
                                    : 'border-2 hover:shadow-xl hover:scale-102'
                                } ${plan.id === 'premium' ? 'md:scale-110' : ''}`}
                        >
                            {plan.id === 'premium' && (
                                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                                    인기
                                </div>
                            )}

                            <CardHeader className={`bg-gradient-to-r ${getTierGradient(plan.id)} text-white pb-8`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/20 rounded-lg">
                                        {getTierIcon(plan.id)}
                                    </div>
                                    {isCurrentPlan && (
                                        <Badge className="bg-white text-purple-600 font-bold">
                                            현재 플랜
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="text-white/90 text-3xl font-bold mt-4">
                                    {plan.price === 0 ? (
                                        '무료'
                                    ) : (
                                        <>
                                            ₩{plan.price.toLocaleString()}
                                            <span className="text-lg font-normal">/월</span>
                                        </>
                                    )}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <Check className="w-5 h-5 text-green-600" />
                                            </div>
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={isCurrentPlan || !isUpgrade}
                                    className={`w-full ${isCurrentPlan
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : `bg-gradient-to-r ${getTierGradient(plan.id)} hover:opacity-90`
                                        } text-white font-bold py-6 text-lg`}
                                >
                                    {isCurrentPlan
                                        ? '현재 사용 중'
                                        : isUpgrade
                                            ? `${plan.name}으로 업그레이드`
                                            : '다운그레이드 불가'}
                                </Button>

                                {plan.id !== 'free' && (
                                    <p className="text-xs text-center text-gray-500">
                                        언제든지 취소 가능합니다
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card className="max-w-4xl mx-auto border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                    <CardTitle className="text-2xl">자주 묻는 질문</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">결제는 어떻게 진행되나요?</h3>
                        <p className="text-gray-600">
                            현재는 데모 버전으로, 실제 결제는 진행되지 않습니다. 프로덕션 환경에서는 안전한 결제 시스템을 통해 진행됩니다.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">구독을 취소하면 어떻게 되나요?</h3>
                        <p className="text-gray-600">
                            구독을 취소하면 다음 결제일부터 무료 플랜으로 전환됩니다. 현재 결제 기간 동안은 프리미엄 기능을 계속 사용할 수 있습니다.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">제휴 마케팅 수익은 어떻게 받나요?</h3>
                        <p className="text-gray-600">
                            Pro 이상 플랜에서 제휴 마케팅 수익을 창출할 수 있습니다. 수익은 매월 말일에 정산되며, 등록하신 계좌로 입금됩니다.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
