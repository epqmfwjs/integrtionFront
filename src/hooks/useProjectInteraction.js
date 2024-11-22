// src/hooks/useProjectInteraction.js
import { useState, useCallback } from 'react';

export const useProjectInteraction = (gl) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleModalConfirm = useCallback(() => {
    if (selectedProject?.url) {
      window.open(selectedProject.url, '_blank');
      setModalOpen(false);
    }
  }, [selectedProject]);

  const handleFrameClick = useCallback((project) => {
    setSelectedProject(project);
    setModalOpen(true);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  const handleMeshClick = useCallback((e, project) => {
    e.stopPropagation();
    handleFrameClick(project);
  }, [handleFrameClick]);

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    gl.domElement.style.cursor = 'pointer';
  }, [gl]);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    gl.domElement.style.cursor = 'default';
  }, [gl]);

  return {
    modalOpen,
    setModalOpen,
    selectedProject,
    handleModalConfirm,
    handleMeshClick,
    handlePointerOver,
    handlePointerOut
  };
};