import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  MessageCircle, Send, Heart, MoreVertical, Edit, Trash2, Archive, ArchiveRestore,
  Image, Paperclip,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SocialFeedProps {
  feed: ReturnType<typeof import("./useFeedActions").useFeedActions>;
}

export default function SocialFeed({ feed }: SocialFeedProps) {
  const {
    user, isAdmin, canViewArchive,
    newPostContent, setNewPostContent,
    expandedComments, setExpandedComments,
    commentTexts, setCommentText,
    postAttachments, setPostAttachments,
    uploadingFile, feedTab, setFeedTab,
    feedPosts, archivedPosts,
    handleCreatePost, handleFileUpload, handleAddComment,
    archivePostMutation, restorePostMutation, deletePostMutation,
    toggleReactionMutation, getUserById,
  } = feed;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-green-100 text-green-700 border-green-200";
      case "due": return "bg-amber-100 text-amber-700 border-amber-200";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </div>
            News & Events Feed
          </CardTitle>
          {canViewArchive && (
            <Tabs value={feedTab} onValueChange={(v) => setFeedTab(v as "live" | "archived")}>
              <TabsList className="h-8">
                <TabsTrigger value="live" className="text-xs px-3 h-7">
                  Live
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1">{feedPosts.filter((p: any) => !p.isArchived).length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="archived" className="text-xs px-3 h-7">
                  <Archive className="h-3 w-3 mr-1" />
                  Archived
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1">{archivedPosts.filter((p: any) => p.isArchived).length}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {feedTab === "live" && (
          <div className="flex gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
                {user?.name?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Share a project update, task, or event..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="mb-2"
              />
              {postAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {postAttachments.map((url, idx) => (
                    <div key={idx} className="relative group">
                      {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img src={url} alt="Attachment" className="h-16 w-16 object-cover rounded border" />
                      ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded border flex items-center justify-center">
                          <Paperclip className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => setPostAttachments(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >x</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <Button variant="ghost" size="sm" className="text-gray-500" asChild disabled={uploadingFile}>
                      <span><Image className="h-4 w-4 mr-1" /> {uploadingFile ? "Uploading..." : "Photo"}</span>
                    </Button>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} disabled={uploadingFile} />
                  </label>
                  <label className="cursor-pointer">
                    <Button variant="ghost" size="sm" className="text-gray-500" asChild disabled={uploadingFile}>
                      <span><Paperclip className="h-4 w-4 mr-1" /> Attach</span>
                    </Button>
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif" onChange={(e) => handleFileUpload(e, 'file')} disabled={uploadingFile} />
                  </label>
                </div>
                <Button size="sm" onClick={handleCreatePost} disabled={!newPostContent.trim() || uploadingFile} className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4 mr-1" /> Post
                </Button>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {feedTab === "archived" && canViewArchive && (
              archivedPosts.filter((p: any) => p.isArchived).length > 0 ? (
                archivedPosts.filter((p: any) => p.isArchived).map((post: any) => {
                  const author = getUserById(post.userId);
                  return (
                    <div key={post.id} className="p-4 border rounded-lg bg-slate-50 border-dashed">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gray-400 text-white">{author?.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-600">{author?.name || "User"}</p>
                            <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-gray-500">Archived</Badge>
                          <Button variant="outline" size="sm" onClick={() => restorePostMutation.mutate({ id: post.id })} disabled={restorePostMutation.isPending}>
                            <ArchiveRestore className="h-4 w-4 mr-1" /> Restore
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => deletePostMutation.mutate({ id: post.id })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-500 whitespace-pre-wrap">{post.content}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No archived posts</p>
                </div>
              )
            )}

            {feedTab === "live" && (feedPosts.length > 0 ? feedPosts.map((post: any) => {
              const author = getUserById(post.userId);
              const userHasLiked = user?.id ? post.reactions?.some((r: any) => r.userId === user.id && r.reaction === "like") : false;
              const attachmentUrls = post.attachments ? (() => { try { return JSON.parse(post.attachments); } catch { return []; } })() : [];
              return (
                <div key={post.id} className="p-4 border rounded-lg hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
                          {author?.name?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{author?.name || "User"}</p>
                        <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => archivePostMutation.mutate({ id: post.id })}><Archive className="h-4 w-4 mr-2" /> Archive</DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem className="text-red-600" onClick={() => deletePostMutation.mutate({ id: post.id })}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>
                  {attachmentUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {attachmentUrls.map((url: string, idx: number) => (
                        url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img key={idx} src={url} alt="Attachment" className="max-h-48 rounded border cursor-pointer hover:opacity-90" onClick={() => window.open(url, '_blank')} />
                        ) : (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 rounded border text-sm text-blue-600 hover:bg-gray-100">
                            <Paperclip className="h-4 w-4" /> Attachment {idx + 1}
                          </a>
                        )
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button
                      variant="ghost" size="sm"
                      className={userHasLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}
                      onClick={() => toggleReactionMutation.mutate({ feedId: post.id, reaction: "like" })}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${userHasLiked ? "fill-current" : ""}`} />
                      Like {post.reactionCount > 0 && `(${post.reactionCount})`}
                    </Button>
                    <Button
                      variant="ghost" size="sm" className="text-gray-500"
                      onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Comment {post.commentCount > 0 && `(${post.commentCount})`}
                    </Button>
                  </div>
                  {expandedComments === post.id && (
                    <div className="mt-3 pt-3 border-t">
                      <FeedCommentsSection feedId={post.id} onAddComment={handleAddComment} commentText={commentTexts[post.id] || ""} setCommentText={(text) => setCommentText(post.id, text)} getUserById={getUserById} />
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No posts yet. Share an update!</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function FeedCommentsSection({
  feedId, onAddComment, commentText, setCommentText, getUserById,
}: {
  feedId: number;
  onAddComment: (feedId: number) => void;
  commentText: string;
  setCommentText: (value: string) => void;
  getUserById: (userId: number) => any;
}) {
  const { data: comments = [], isLoading } = trpc.feed.getComments.useQuery({ feedId });

  if (isLoading) return <div className="text-sm text-gray-500 py-2">Loading comments...</div>;

  return (
    <div className="space-y-3">
      {comments.length > 0 ? (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {comments.map((comment: any) => {
            const author = getUserById(comment.userId);
            return (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="text-xs bg-gray-200">{author?.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="bg-gray-50 rounded-lg px-3 py-1.5 flex-1">
                  <p className="text-xs font-medium">{author?.name || "User"}</p>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="text-sm h-8"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAddComment(feedId); }
          }}
        />
        <Button size="sm" className="h-8" onClick={() => onAddComment(feedId)} disabled={!commentText.trim()}>
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
