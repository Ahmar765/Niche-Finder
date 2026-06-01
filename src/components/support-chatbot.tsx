
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, User, Bot, AlertTriangle, Coins, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { useUser } from '@/firebase/auth/use-user';
import { submitChatMessage } from '@/backend/actions';
import { toast } from 'sonner';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/shared/utils';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    id: string;
};

/**
 * OS CORE: Support Co-pilot
 * SECURITY RULE: Generic error handling to hide system logic and provider complexity.
 */
export function SupportChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'initial',
                    role: 'assistant',
                    content: 'System Initialized. I am NicheBot, your Venture OS Co-pilot. How can I assist with your venture orchestration today?'
                }
            ]);
        }
    }, [isOpen, messages.length]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const history = messages.map(({ id, ...rest }) => rest);

        try {
            const result = await submitChatMessage(history, userMessage.content);

            if (result.error || !result.response) {
                throw new Error(result.error || 'Connection Timeout');
            }
            
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.response.response
            };
            setMessages(prev => [...prev, assistantMessage]);

            if (result.billingDetails) {
                 toast.info(`Intelligence Consumption: ${result.billingDetails.finalCost} ACU`, {
                    description: `Wallet Balance: ${result.billingDetails.balanceAfter.totalAvailableAcu} ACU`,
                    icon: <Coins className="h-4 w-4" />
                });
            }

            if (result.response.escalateToHuman) {
                 toast.warning('Human Strategy Escalation', {
                    description: 'Your query has been queued for a human venture specialist.',
                    icon: <AlertTriangle className="h-4 w-4" />
                });
            }

        } catch (error: any) {
            // SECURITY RULE: Map technical errors to OS-level generic messages
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Venture OS: Intelligence sync interrupted. Our cognitive cores are recalibrating. Please try your request again in a moment."
            };
            setMessages(prev => [...prev, errorMessage]);
            console.error('[SupportChat] Internal Log (Hidden from user):', error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!user) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px] h-[70vh] flex flex-col p-0 gap-0 border-primary/20 shadow-2xl">
                    <DialogHeader className="p-4 border-b bg-secondary/10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                                    <Bot className="h-4 w-4 text-primary" />
                                    NicheBot Co-pilot
                                </DialogTitle>
                                <DialogDescription className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Venture OS v1.2 Active</DialogDescription>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-[8px] font-bold text-green-500 border border-green-500/20">
                                <ShieldCheck className="h-2.5 w-2.5" />
                                SECURE
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 bg-[#040b16]/50" ref={scrollAreaRef as any}>
                        <div className="p-4 space-y-4">
                            <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className={cn("flex items-end gap-2", message.role === 'user' ? "justify-end" : "justify-start")}
                                >
                                    {message.role === 'assistant' && (
                                        <Avatar className="h-7 w-7 border border-primary/20">
                                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">OS</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                                        message.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-secondary/40 text-foreground rounded-bl-none border border-border/40 shadow-sm"
                                    )}>
                                        {message.content}
                                    </div>
                                    {message.role === 'user' && (
                                        <Avatar className="h-7 w-7 border border-border">
                                            <AvatarFallback className="bg-muted text-[10px] font-bold">ME</AvatarFallback>
                                        </Avatar>
                                    )}
                                </motion.div>
                            ))}
                            </AnimatePresence>
                             {isLoading && (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-end gap-2 justify-start"
                                >
                                    <Avatar className="h-7 w-7 border border-primary/20 animate-pulse">
                                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">OS</AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-xs rounded-2xl rounded-bl-none px-3 py-2 text-xs bg-secondary/40 flex items-center gap-2 border border-border/40">
                                        <Loader2 className="h-3 w-3 animate-spin text-primary"/>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Syncing Intelligence...</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-4 border-t bg-background">
                        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Command the OS..."
                                disabled={isLoading}
                                autoComplete="off"
                                className="h-9 text-xs bg-secondary/20 border-border/40 focus:ring-primary/20"
                            />
                            <Button type="submit" size="icon" className="h-9 w-9 rounded-full" disabled={isLoading || !input.trim()}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Button
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl border-2 border-primary/20 bg-background/80 backdrop-blur-md text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                onClick={() => setIsOpen(true)}
            >
                <Bot className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-background"></span>
                </span>
            </Button>
        </>
    );
}
