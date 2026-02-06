import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/_core/hooks/useAuth";

export function useFeedActions() {
  const { isAdmin, isManager } = usePermissions();
  const { user } = useAuth();
  const canViewArchive = isAdmin || isManager;

  const [newPostContent, setNewPostContent] = useState("");
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [postAttachments, setPostAttachments] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [feedTab, setFeedTab] = useState<"live" | "archived">("live");

  const { data: feedPosts = [] } = trpc.feed.getAll.useQuery(undefined, { refetchInterval: 10000 });
  const { data: archivedPosts = [] } = trpc.feed.getArchived.useQuery(undefined, {
    enabled: canViewArchive,
    refetchInterval: 30000,
  });
  const { data: users = [] } = trpc.users.getAll.useQuery(undefined, { refetchInterval: 60000 });

  const utils = trpc.useUtils();

  const createPostMutation = trpc.feed.create.useMutation({
    onSuccess: () => {
      toast.success("Post shared successfully!");
      setNewPostContent("");
      setShowPostDialog(false);
      utils.feed.getAll.invalidate();
    },
    onError: (error) => toast.error("Failed to create post: " + error.message),
  });

  const archivePostMutation = trpc.feed.archive.useMutation({
    onSuccess: () => {
      toast.success("Post archived");
      utils.feed.getAll.invalidate();
      utils.feed.getArchived.invalidate();
    },
    onError: (error) => toast.error("Failed to archive post: " + error.message),
  });

  const restorePostMutation = trpc.feed.restore.useMutation({
    onSuccess: () => {
      toast.success("Post restored");
      utils.feed.getAll.invalidate();
      utils.feed.getArchived.invalidate();
    },
    onError: (error) => toast.error("Failed to restore post: " + error.message),
  });

  const deletePostMutation = trpc.feed.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      utils.feed.getAll.invalidate();
    },
    onError: (error) => toast.error("Failed to delete post: " + error.message),
  });

  const toggleReactionMutation = trpc.feed.toggleReaction.useMutation({
    onSuccess: () => utils.feed.getAll.invalidate(),
  });

  const addCommentMutation = trpc.feed.addComment.useMutation({
    onSuccess: () => {
      toast.success("Comment added!");
      utils.feed.getAll.invalidate();
    },
    onError: (error) => toast.error("Failed to add comment: " + error.message),
  });

  const uploadAttachmentMutation = trpc.attachments.upload.useMutation({
    onSuccess: (data) => {
      setPostAttachments(prev => [...prev, data.url]);
      setUploadingFile(false);
      toast.success("File attached!");
    },
    onError: (error) => {
      setUploadingFile(false);
      toast.error("Failed to upload: " + error.message);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    setUploadingFile(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await uploadAttachmentMutation.mutateAsync({
        entityType: "feed_draft",
        entityId: 0,
        fileName: file.name,
        fileData: base64,
        fileType: file.type,
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    createPostMutation.mutate({
      content: newPostContent,
      status: "live",
      attachments: postAttachments.length > 0 ? JSON.stringify(postAttachments) : undefined,
    });
    setPostAttachments([]);
  };

  const handleAddComment = (feedId: number) => {
    const commentText = commentTexts[feedId] || "";
    if (!commentText.trim()) return;
    addCommentMutation.mutate({ feedId, content: commentText });
    setCommentTexts(prev => ({ ...prev, [feedId]: "" }));
  };

  const setCommentText = (feedId: number, text: string) => {
    setCommentTexts(prev => ({ ...prev, [feedId]: text }));
  };

  const getUserById = (userId: number) => users.find(u => u.id === userId);

  return {
    user, isAdmin, isManager, canViewArchive,
    newPostContent, setNewPostContent,
    showPostDialog, setShowPostDialog,
    expandedComments, setExpandedComments,
    commentTexts, setCommentText,
    postAttachments, setPostAttachments,
    uploadingFile, feedTab, setFeedTab,
    feedPosts, archivedPosts, users,
    handleCreatePost, handleFileUpload, handleAddComment,
    archivePostMutation, restorePostMutation, deletePostMutation,
    toggleReactionMutation,
    getUserById,
  };
}
