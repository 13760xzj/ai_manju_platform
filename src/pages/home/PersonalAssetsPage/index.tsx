import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/store/hooks';
import type { Asset, Work, AssetCategory } from '@/types';
import { ASSET_CATEGORIES } from '@/utils';
import { Toolbar, AssetCard, WorkCard, DetailPanel } from '@/components/features';
import {
  setSelectedCategory,
  setViewMode,
  setSearchQuery,
  setSelectedItem,
  setDetailPanelOpen,
  fetchAssets,
  fetchWorks
} from '@/store/slices/assetSlice';
import type { RootState } from '@/store';
import './index.css';

export function PersonalAssetsPage() {
  const dispatch = useAppDispatch();
  const { assets, works, selectedCategory, viewMode, searchQuery, selectedItem, isDetailPanelOpen, assetsStatus, worksStatus } =
    useSelector((state: RootState) => state.asset);

  useEffect(() => {
    dispatch(fetchAssets(undefined));
    dispatch(fetchWorks());
  }, [dispatch]);

  const [activeSection, setActiveSection] = useState<'material' | 'works'>('material');

  const handleItemClick = (item: Asset | Work) => {
    dispatch(setSelectedItem(item));
    dispatch(setDetailPanelOpen(true));
  };

  const handleCloseDetail = () => {
    dispatch(setDetailPanelOpen(false));
  };

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredWorks = works.filter(work =>
    work.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [activeTab, setActiveTab] = useState<'personal' | 'company'>('personal');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['material', 'works']);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => 
      prev.includes(folder) 
        ? prev.filter(f => f !== folder)
        : [...prev, folder]
    );
  };

  return (
    <div className="personal-assets-page">
      <aside className="assets-sidebar">
        <div className="sidebar-header">资源管理器</div>
        <nav className="assets-nav">
          <div className="folder-tree">
            <div 
              className="tree-item folder"
              onClick={() => toggleFolder('material')}
            >
              <span className="folder-icon">{expandedFolders.includes('material') ? '📂' : '📁'}</span>
              <span className="folder-name">素材库</span>
            </div>
            {expandedFolders.includes('material') && (
              <div className="tree-children">
                {ASSET_CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    className={`tree-item ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSection('material');
                      dispatch(setSelectedCategory(cat.id));
                    }}
                  >
                    <span className="item-icon">📄</span>
                    <span className="item-name">{cat.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div 
              className="tree-item folder"
              onClick={() => toggleFolder('works')}
            >
              <span className="folder-icon">{expandedFolders.includes('works') ? '📂' : '📁'}</span>
              <span className="folder-name">我的作品</span>
            </div>
            {expandedFolders.includes('works') && (
              <div className="tree-children">
                <div
                  className={`tree-item ${activeSection === 'works' ? 'active' : ''}`}
                  onClick={() => setActiveSection('works')}
                >
                  <span className="item-icon">🎬</span>
                  <span className="item-name">全部作品</span>
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <main className="assets-main">
        <div className="assets-tabs">
          <button
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            个人资产库
          </button>
          <button
            className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
          >
            公司资产库
          </button>
        </div>

        <div className="assets-breadcrumb">
          <span className="breadcrumb-item">首页</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">{activeTab === 'personal' ? '个人资产库' : '公司资产库'}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">{activeSection === 'material' ? '素材库' : '我的作品'}</span>
        </div>

        <Toolbar
          title=""
          viewMode={viewMode}
          onViewModeChange={(mode) => dispatch(setViewMode(mode))}
          searchQuery={searchQuery}
          onSearchChange={(query) => dispatch(setSearchQuery(query))}
          categories={activeSection === 'material' ? [...ASSET_CATEGORIES] : undefined}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => dispatch(setSelectedCategory(cat as AssetCategory))}
          showCreate={false}
          showBatch={false}
        />

        <div className="assets-content">
          {activeTab === 'company' ? (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <div className="empty-text">公司资产库暂未开放</div>
            </div>
          ) : activeSection === 'material' ? (
            <>
              {assetsStatus.loading && <div className="loading-placeholder">加载中...</div>}
              {assetsStatus.error && <div className="error-placeholder">{assetsStatus.error}</div>}
              {!assetsStatus.loading && !assetsStatus.error && (
                <div className={`material-grid view-${viewMode}`}>
                  {filteredAssets.map(asset => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      viewMode={viewMode}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {worksStatus.loading && <div className="loading-placeholder">加载中...</div>}
              {worksStatus.error && <div className="error-placeholder">{worksStatus.error}</div>}
              {!worksStatus.loading && !worksStatus.error && (
                <div className={`works-grid view-${viewMode}`}>
                  {filteredWorks.map(work => (
                    <WorkCard
                      key={work.id}
                      work={work}
                      viewMode={viewMode}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <DetailPanel
        item={selectedItem}
        isOpen={isDetailPanelOpen}
        onClose={handleCloseDetail}
        categories={[...ASSET_CATEGORIES]}
      />
    </div>
  );
}
