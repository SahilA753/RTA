'use client';
import React, { useEffect, useState } from 'react';
import SelectedWorkspace from './selected-workspace';
import CustomDialogTrigger from '../global/custom-dialog-trigger';
import WorkspaceCreator from '../global/workspace-creator';
import { Workspace } from '@/lib/types';
import { User } from '@/lib/types';



interface WorkspaceDropdownProps {
  privateWorkspaces: Workspace[] | [];
  sharedWorkspaces: Workspace[] | [];
  collaboratingWorkspaces: Workspace[] | [];
  user:User|null,
  defaultValue: Workspace | undefined;
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
  privateWorkspaces,
  collaboratingWorkspaces,
  sharedWorkspaces,
  user,
  defaultValue,
}) => {
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  // Handle workspace selection
  const handleSelect = (option: Workspace) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  // Set the default selected workspace
  useEffect(() => {
    if (defaultValue) {
      setSelectedOption(defaultValue);
    }
  }, [defaultValue]);

  return (
    <div className="relative inline-block text-left">
      <div className="flex justify-center items-center h-full">
        <span onClick={() => setIsOpen(!isOpen)}>
          {selectedOption ? (
            <SelectedWorkspace workspace={selectedOption} />
          ) : (
            'Select a workspace'
          )}
        </span>
      </div>
      {isOpen && (
        <div
          className="origin-top-right absolute w-full rounded-md shadow-md z-50 h-[190px] bg-black/10 backdrop-blur-lg group overflow-scroll border-[1px] border-muted"
        >
          <div className="rounded-md flex flex-col">
            <div className="!p-2">
              {!!privateWorkspaces.length && (
                <>
                  <p className="text-muted-foreground">Private</p>
                  <hr />
                  {privateWorkspaces.map((option) => (
                    <SelectedWorkspace
                      key={option.id}
                      workspace={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}
              {!!sharedWorkspaces.length && (
                <>
                  <p className="text-muted-foreground">Shared</p>
                  <hr />
                  {sharedWorkspaces.map((option) => (
                    <SelectedWorkspace
                      key={option.id}
                      workspace={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}
              {!!collaboratingWorkspaces.length && (
                <>
                  <p className="text-muted-foreground">Collaborating</p>
                  <hr />
                  {collaboratingWorkspaces.map((option) => (
                    <SelectedWorkspace
                      key={option.id}
                      workspace={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}
            </div>
            <CustomDialogTrigger
              header="Create A Workspace"
              content={<WorkspaceCreator user={user}/>}
              description="Create and manage your workspaces. You can also adjust privacy settings later."
            >
              <div className="flex transition-all hover:bg-muted justify-center items-center gap-2 p-2 w-full">
                <article className="text-slate-500 rounded-full bg-slate-800 w-4 h-4 flex items-center justify-center">
                  +
                </article>
                Create workspace
              </div>
            </CustomDialogTrigger>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDropdown;
