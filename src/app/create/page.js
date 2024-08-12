'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { TbFidgetSpinner } from 'react-icons/tb';
import axios from 'axios';

export default function CreateFunction() {
  const { toast } = useToast();
  const [chatName, setChatName] = useState('');
  const [sysmsg, setSysmsg] = useState('');
  const [chatModel, setChatModel] = useState('gpt-3.5-turbo-0125');
  const [temperature, setTemperature] = useState(0);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [OpenAiKey, setOpenAiKey] = useState('');
  const token = localStorage.getItem('token');

  // --------------------------------------------------------
  const testOpenAIKey = async (apiKey) => {
    const data = {
      model: 'gpt-3.5-turbo-0125',
      messages: [{ role: 'user', content: 'Say this is a test!' }],
      temperature: 0.7,
    };

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'OpenAI Key is invalid.',
        description: 'Please enter a valid OpenAI key.',
      });

      return false;
    }
  };

  // --------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

   

    if (!chatName || !files || !chatModel || files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Please fill all the fields.',
      });
      return;
    }

    if (testOpenAIKey(OpenAiKey) === false) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Please enter a valid OpenAI key.',
      });
      return;
    };

    setLoading(true);

    const formData = new FormData();

    formData.append('chat_name', chatName);
    formData.append('sys_message', sysmsg);
    formData.append('chat_model', chatModel);
    formData.append('temperature', temperature || 0);
    formData.append('openai_key', OpenAiKey);
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`/api/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, 
        },
      });
      console.log(response.data);
      if (response.status === 200) {
        setLoading(false);
        toast({
          title: 'Success',
          description: 'Chat created successfully.',
        });
        window.location = '/chatbots';
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request. false',
        });
        setLoading(false);
      }
    } catch (error) {
      const msg = error.response.data.detail;
      setLoading(false);
      if (msg) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: msg,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.',
        });
      }
    }
  };

  const handleFileUpload = (files) => {
    setFiles(files);
    console.log(files);
  };

  // --------------------------------------------------------

  return (
    <>
      <section className="create_chat min-h-screen">
        <div className="flex w-[100vw] flex-col items-start justify-center md:h-screen md:flex-row md:items-center">
          {' '}
          <div className="BACK flex h-full w-full flex-col items-center justify-center md:w-[4vw]">
            <Button
              asChild
              variant="outline"
              className="dark group h-full w-full rounded-none "
            >
              <Link href="/dashboard">
                <ChevronLeftIcon className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </Link>
            </Button>
          </div>
          <div className="mx-auto grid min-h-[100vh] w-full grid-cols-2 gap-6 p-2 md:my-auto md:h-[90vh] md:w-[96vw] md:grid-cols-3 md:p-6">
            <div className="sidetab col-span-2 flex flex-col items-center justify-center text-white md:col-span-1">
              {/* Tab Start Here */}

              <Card className="flex h-full max-h-screen w-full flex-col ">
                <CardHeader>
                  <CardTitle>Create Chatbot</CardTitle>
                  <CardDescription>
                    Make changes to your Chatbot details here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grow space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      value={chatName}
                      onChange={(event) => {
                        setChatName(event.target.value);
                      }}
                      id="name"
                      defaultValue="Your Name"
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="sysmsg">System Message</Label>
                    <Textarea
                      className="resize-none"
                      rows="3"
                      id="sysmsg"
                      value={sysmsg}
                      onChange={(event) => setSysmsg(event.target.value)}
                      placeholder="Type your message here."
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="openai">Openai Key</Label>
                    <Input
                      id="openai"
                      autoComplete="off"
                      value={OpenAiKey}
                      onChange={(event) => setOpenAiKey(event.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="name">Model</Label>
                    <Select
                      className=""
                      value={chatModel}
                      onValueChange={setChatModel}
                      defaultValue="gpt-3.5-turbo-0125"
                    >
                      <SelectTrigger className="">
                        <SelectValue placeholder="GPT Model" />
                      </SelectTrigger>
                      <SelectContent className="">
                        <SelectGroup>
                          <SelectLabel>Model</SelectLabel>
                          <SelectItem value="gpt-3.5-turbo-0125">
                            GPT 3.5 Turbo
                          </SelectItem>
                          <SelectItem value="gpt-4-0125-preview">
                            GPT 4 Turbo (More Efficient)
                          </SelectItem>
                          <SelectItem value="gpt-4o-mini">
                            GPT 4 Mini (Cheapest)
                          </SelectItem>
                          
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 ">
                    <div className="grid gap-2 pt-2">
                      <HoverCard openDelay={200}>
                        <HoverCardTrigger asChild>
                          <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="temperature">Temperature</Label>
                              <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
                                {temperature}
                              </span>
                            </div>
                            <Slider
                              id="temperature"
                              max={1}
                              defaultValue={[temperature]}
                              step={0.1}
                              onValueChange={(values) =>
                                setTemperature(values[0])
                              }
                              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                              aria-label="Temperature"
                            />
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent
                          align="start"
                          className="w-[260px] text-sm"
                          side="left"
                        >
                          Controls randomness: lowering results in less random
                          completions. As the temperature approaches zero, the
                          model will become deterministic and repetitive.
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <TbFidgetSpinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <></>
                    )}{' '}
                    Create
                  </Button>
                </CardFooter>
              </Card>

              {/* Tab End Here */}
            </div>

            <div className="sidetab col-span-2 flex h-full w-full flex-col items-center justify-center">
              <Tabs
                defaultValue="files"
                className="flex h-full max-h-screen w-full flex-col"
              >
                <TabsList className="grid h-[6vh] w-full grid-cols-1">
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="files" className="h-[86vh]">
                  <ScrollArea className="h-[86vh] w-full rounded-md border">
                    <div className="w-full mx-auto h-full border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                      <FileUpload
                        className="h-full"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
