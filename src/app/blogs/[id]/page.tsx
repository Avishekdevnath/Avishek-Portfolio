import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaTag } from "react-icons/fa";
import { blogPosts } from "../../../data/blogData";

// Define the expected shape of the params object
type BlogPostParams = {
  id: string;
};

// Update the component to expect params as a Promise<BlogPostParams>
export default async function BlogPost({ params }: { params: Promise<BlogPostParams> }) {
  // Await the params to get the actual parameter values
  const { id } = await params;
  
  // Find the blog post using the id
  const post = blogPosts.find((p) => p.id === id);
  
  // If no post is found, trigger a 404
  if (!post) {
    notFound();
  }

  // Render the blog post details
  return (
    <div className="bg-gray-100 min-h-screen">
      <section className="py-16 flex flex-col items-center">
        <div className="w-full max-w-4xl px-4 mb-8">
          <Link
            href="/blogs"
            className="flex items-center space-x-2 text-blue-600 hover:underline"
          >
            <FaArrowLeft />
            <span>Back to Blog</span>
          </Link>
        </div>
        <div className="w-full max-w-4xl px-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
            <div className="flex items-center space-x-3 text-sm text-gray-500 mb-6">
              <span>{post.date}</span>
              <span>|</span>
              <span className="flex items-center space-x-1">
                <FaTag />
                <span>{post.category}</span>
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed">{post.content}</p>
          </div>
        </div>
      </section>
    </div>
  );
}