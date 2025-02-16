"use client"

import { useState, useEffect, useCallback } from "react";
import ResourceCurator from '@/components/ResourceCurator';
import { StoredResources } from "@/components/resources/StoredResources";
import { Separator } from "@/components/ui/separator";
import type { CuratedResource } from "@/components/resources/StoredResources";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { PaginationNav } from "@/components/ui/pagination-nav";

const ITEMS_PER_PAGE = 5;

export default function ResourcesPage() {
  const { data: session } = useSession();
  const [storedResources, setStoredResources] = useState<CuratedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchResources = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const data = await apiClient.getCuratedResources(session.user.id);
      console.log("Fetched resources data:", data);
      
      if (data.error) {
        console.error("API returned error:", data.error);
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to fetch resources. Please try again."
        });
        setStoredResources([]);
        return;
      }
      
      if (data.resources && Array.isArray(data.resources)) {
        // Validate the structure of each resource
        const validResources = data.resources.filter((resource: CuratedResource) => {
          return resource && 
                 resource._id && 
                 resource.topic && 
                 Array.isArray(resource.resources);
        });
        
        console.log("Valid resources:", validResources);
        setStoredResources(validResources);
      } else {
        console.error("Invalid resources data structure:", data);
        setStoredResources([]);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to fetch resources. Please try again."
      });
      setStoredResources([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, toast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleResourceDelete = (resourceId: string) => {
    setStoredResources(resources => resources.filter(resource => resource._id !== resourceId));
    toast({
      variant: "success",
      title: "Success",
      description: "Resource deleted successfully."
    });
  };

  const handleCreateResources = async (subject: string) => {
    if (!session?.user?.id) return;
    try {
      await apiClient.createCuratedResources(session.user.id, subject);
      toast({
        variant: "success",
        title: "Success",
        description: "Resources created successfully."
      });
      // Refresh resources after creation
      fetchResources();
    } catch (error: unknown) {
      console.error('Error creating resources:', error);
      
      // Type guard to check if error is an object with status property
      if (error && typeof error === 'object' && 'status' in error) {
        const errorObj = error as { status: number; retryAfter?: number };
        // Handle rate limit errors
        if (errorObj.status === 429 || errorObj.status === 413) {
          const retryAfter = errorObj.retryAfter || 60;
          const minutes = Math.ceil(retryAfter / 60);
          toast({
            variant: "error",
            title: "Rate Limit Exceeded",
            description: `Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}. Our AI service has reached its limit.`
          });
          return;
        }
      }

      // Type guard for response error
      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { 
          response?: { 
            data?: { 
              error?: string; 
              message?: string; 
            } 
          };
          message?: string;
        };

        if (responseError.response?.data?.error === 'RESOURCE_EXISTS') {
          toast({
            variant: "default",
            title: "Resources Already Exist",
            description: responseError.response.data.message || "You already have resources for this subject."
          });
          
          // Scroll to existing resources section
          const resourcesSection = document.getElementById('stored-resources');
          if (resourcesSection) {
            resourcesSection.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }
      }

      // Default error handling
      toast({
        variant: "error",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create resources. Please try again."
      });
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(storedResources.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResources = storedResources.slice(startIndex, endIndex);

  return (
    <div className="p-6 sm:p-8 md:p-10 bg-[#EFE9D5] min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-0">
          Resource Curator
        </h1>
        <span className="text-sm sm:text-base text-gray-600">
          Find and manage learning resources
        </span>
      </div>
      <div className="w-full max-w-10xl mx-auto">
        <ResourceCurator onCreateResources={handleCreateResources} />
      </div>

      {/* Stored Resources Section */}
      {loading ? (
        <div className="mt-10 sm:mt-12">
          <Separator className="my-8 sm:my-10" />
          <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 mb-6 sm:mb-8" />
          <div className="space-y-6 sm:space-y-8">
            <Skeleton className="h-[150px] sm:h-[200px] w-full" />
            <Skeleton className="h-[150px] sm:h-[200px] w-full" />
          </div>
        </div>
      ) : (
        <div id="stored-resources" className="mt-10 sm:mt-12">
          <Separator className="my-8 sm:my-10" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">
            Your Curated Resources
          </h2>
          {storedResources.length > 0 ? (
            <>
              <div className="space-y-6 sm:space-y-8">
                {currentResources.map((resource) => (
                  <StoredResources
                    key={resource._id}
                    resource={resource}
                    onDelete={handleResourceDelete}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <PaginationNav
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-600">
              <p>You haven&apos;t curated any resources yet.</p>
              <p className="mt-2">Use the form above to get personalized learning resources!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}