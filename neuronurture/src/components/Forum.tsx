
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Heart, Reply, Search, Plus, Users, Clock } from 'lucide-react';

const Forum = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Tips for dealing with pregnancy anxiety?",
      content: "I'm 24 weeks pregnant and feeling really anxious about everything. Has anyone found ways to cope with this?",
      author: "Sarah M.",
      category: "pregnancy",
      replies: 12,
      likes: 8,
      timestamp: "2 hours ago",
      isAnonymous: false
    },
    {
      id: 2,
      title: "When did your toddler start showing reading readiness?",
      content: "My 3-year-old seems interested in letters and books. What signs should I look for that indicate reading readiness?",
      author: "Anonymous",
      category: "child-development",
      replies: 7,
      likes: 15,
      timestamp: "5 hours ago",
      isAnonymous: true
    },
    {
      id: 3,
      title: "Postpartum depression - you're not alone",
      content: "Want to share that it's okay to struggle after birth. Seeking help was the best decision I made.",
      author: "Dr. Emily C.",
      category: "mental-health",
      replies: 24,
      likes: 45,
      timestamp: "1 day ago",
      isAnonymous: false,
      isDoctorVerified: true
    }
  ]);

  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    isAnonymous: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'pregnancy', label: 'Pregnancy' },
    { value: 'postpartum', label: 'Postpartum' },
    { value: 'child-development', label: 'Child Development' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'general', label: 'General' }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = () => {
    if (newPost.title && newPost.content && newPost.category) {
      const post = {
        id: posts.length + 1,
        ...newPost,
        author: newPost.isAnonymous ? 'Anonymous' : 'You',
        replies: 0,
        likes: 0,
        timestamp: 'Just now',
        isDoctorVerified: false
      };
      
      setPosts([post, ...posts]);
      setNewPost({ title: '', content: '', category: '', isAnonymous: false });
      setShowNewPost(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      pregnancy: 'bg-pink-100 text-pink-700',
      postpartum: 'bg-purple-100 text-purple-700',
      'child-development': 'bg-blue-100 text-blue-700',
      'mental-health': 'bg-green-100 text-green-700',
      general: 'bg-gray-100 text-gray-700'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Community Forum</h1>
          <p className="text-gray-600">Connect, share, and support each other</p>
        </div>
        <Button 
          onClick={() => setShowNewPost(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Community Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">2,847</div>
            <div className="text-blue-100">Active Members</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">156</div>
            <div className="text-green-100">Posts This Week</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">1,234</div>
            <div className="text-purple-100">Helpful Responses</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Post title..."
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            
            <Select value={newPost.category} onValueChange={(value) => setNewPost({ ...newPost, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.slice(1).map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Textarea
              placeholder="Share your thoughts, questions, or experiences..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
            />
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newPost.isAnonymous}
                  onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                  className="rounded"
                />
                Post anonymously
              </label>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={handleCreatePost} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                Post
              </Button>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {categories.find(c => c.value === post.category)?.label}
                  </span>
                  {post.isDoctorVerified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      ✓ Doctor Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {post.timestamp}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{post.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>by {post.author}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Reply className="h-4 w-4" />
                    <span className="text-sm">{post.replies}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Discussion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Be respectful and supportive to all community members</p>
            <p>• Share experiences to help others, but avoid giving medical advice</p>
            <p>• Keep posts relevant to motherhood, pregnancy, and child development</p>
            <p>• Protect privacy - yours and others'. Use anonymous posting when needed</p>
            <p>• Report any inappropriate content to our moderators</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forum;
