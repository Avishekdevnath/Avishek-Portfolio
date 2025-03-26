import React from "react";
import Link from "next/link";
import { FaSearch, FaTag } from "react-icons/fa";
import { blogPosts, categories } from "../../data/blogData";

export default function Blogs() {
    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Blog Section */}
            <section className="py-16 flex flex-col items-center">
                <div className="text-center mb-12">
                    <h4 className="text-md text-gray-600">Explore My Thoughts</h4>
                    <h2 className="text-5xl font-bold text-black">Blog</h2>
                </div>

                <div className="w-full max-w-6xl px-4">
                    {/* Search Field */}
                    <div className="mb-12 flex justify-center">
                        <div className="relative w-full max-w-lg">
                            <input
                                type="text"
                                placeholder="Search blog posts..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>

                    {/* Blog List and Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Blog List */}
                        <div className="lg:col-span-2 space-y-8">
                            {blogPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-white p-6 rounded-xl shadow-md"
                                >
                                    <Link href={`/blogs/${post.id}`}>
                                        <h3 className="text-2xl font-semibold text-gray-800 hover:text-blue-600 transition mb-2">
                                            {post.title}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
                                        <span>{post.date}</span>
                                        <span>|</span>
                                        <span className="flex items-center space-x-1">
                                            <FaTag />
                                            <span>{post.category}</span>
                                        </span>
                                    </div>
                                    <p className="text-gray-600">{post.excerpt}</p>
                                </div>
                            ))}
                        </div>

                        {/* Categories Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-md sticky top-4">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    Categories
                                </h3>
                                <ul className="space-y-3">
                                    {categories.map((category, index) => (
                                        <li key={index}>
                                            <Link
                                                href="#"
                                                className="flex justify-between items-center text-gray-700 hover:text-blue-600 transition"
                                            >
                                                <span>{category.name}</span>
                                                <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded-full">
                                                    {category.count}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}